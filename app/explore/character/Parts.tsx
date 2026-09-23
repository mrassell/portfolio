'use client';

import { useEffect, useMemo, useReducer } from 'react';
import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CHEST_Y, PALETTE, TORSO_DEPTH, TORSO_PROFILE, torsoRadiusAt, torsoSurfaceZ } from './spec';

type Vec3 = THREE.Vector3;
type Side = 1 | -1;
type ResourceSet = Record<string, { dispose(): void }>;
type PointFn = (u: number, v: number, out: Vec3) => void;

const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const spow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);
const domeEnd = (u: number, cap: number) =>
  u > 1 - cap ? Math.sqrt(Math.max(0, 1 - ((u - 1 + cap) / cap) ** 2)) : 1;

const TORSO_BOTTOM = TORSO_PROFILE[1][1];
const TORSO_TOP = TORSO_PROFILE[TORSO_PROFILE.length - 1][1];

const LINING = '#2a1d1f';
const METAL = '#bdb7ab';
const NAIL = new THREE.Color(PALETTE.skinLight).lerp(new THREE.Color('#ecc8b6'), 0.35);

function table(vals: readonly number[], x: number) {
  const n = vals.length - 1;
  const f = clamp01(x) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const t = f - i;
  const p0 = vals[Math.max(0, i - 1)];
  const p1 = vals[i];
  const p2 = vals[i + 1];
  const p3 = vals[Math.min(n, i + 2)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
}

function weldPoles(g: THREE.BufferGeometry, cols: number, lastRow: number) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nor = g.getAttribute('normal') as THREE.BufferAttribute;
  const a = V();
  const b = V();
  const sum = V();
  for (const row of [0, lastRow]) {
    const start = row * cols;
    a.fromBufferAttribute(pos, start);
    let same = true;
    for (let j = 1; j < cols && same; j++) same = b.fromBufferAttribute(pos, start + j).distanceToSquared(a) < 1e-12;
    if (!same) continue;
    sum.set(0, 0, 0);
    for (let j = 0; j < cols; j++) sum.add(b.fromBufferAttribute(nor, start + j));
    if (sum.lengthSq() < 1e-12) continue;
    sum.normalize();
    for (let j = 0; j < cols; j++) nor.setXYZ(start + j, sum.x, sum.y, sum.z);
  }
}

// Grid surface: outward normal = dP/du x dP/dv.
function patch(nu: number, nv: number, fn: PointFn, closed = true) {
  const cols = closed ? nv : nv + 1;
  const pos = new Float32Array((nu + 1) * cols * 3);
  const p = V();
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j < cols; j++) {
      fn(i / nu, j / nv, p);
      p.toArray(pos, (i * cols + j) * 3);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const j1 = closed ? (j + 1) % cols : j + 1;
      const a = i * cols + j;
      const b = i * cols + j1;
      const c = (i + 1) * cols + j;
      const d = (i + 1) * cols + j1;
      index.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  weldPoles(g, cols, nu);
  return g;
}

function merge(geos: THREE.BufferGeometry[]) {
  const parts = geos.map((g) => {
    const c = g.clone();
    for (const key of Object.keys(c.attributes)) if (key !== 'position' && key !== 'normal') c.deleteAttribute(key);
    if (!c.index) c.setIndex(Array.from({ length: c.getAttribute('position').count }, (_, i) => i));
    return c;
  });
  const out = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  geos.forEach((g) => g.dispose());
  return out;
}

function taperTube(curve: THREE.Curve<Vec3>, radius: (u: number) => number, segs: number, radial = 12, flat = 1) {
  const frames = curve.computeFrenetFrames(segs, false);
  const p = V();
  return patch(segs, radial, (u, v, out) => {
    const i = Math.round(u * segs);
    const a = v * TAU;
    const r = radius(u);
    curve.getPointAt(u, p);
    out
      .copy(p)
      .addScaledVector(frames.normals[i], Math.cos(a) * r * flat)
      .addScaledVector(frames.binormals[i], -Math.sin(a) * r);
  });
}

interface BandOpts {
  segs?: number;
  radial?: number;
  closed?: boolean;
  lift?: number;
  exp?: number;
  width?: (u: number) => number;
}

// Flat strip swept along points; `up` gives the approximate outward normal of its broad face.
function band(pts: Vec3[], up: (p: Vec3, out: Vec3) => void, hw: number, ht: number, o: BandOpts = {}) {
  const curve = new THREE.CatmullRomCurve3(pts, o.closed ?? false, 'centripetal');
  const e = o.exp ?? 0.4;
  const p = V();
  const t = V();
  const n = V();
  const w = V();
  return patch(o.segs ?? 20, o.radial ?? 8, (u, v, out) => {
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    up(p, n);
    w.crossVectors(t, n).normalize();
    n.crossVectors(w, t).normalize();
    const a = v * TAU;
    const cx = spow(Math.cos(a), e) * hw * (o.width ? o.width(u) : 1);
    const cy = spow(Math.sin(a), e) * ht;
    out.copy(p).addScaledVector(w, cx).addScaledVector(n, cy + (o.lift ?? 0));
  });
}

function ellipsoid(radii: Vec3, basis: THREE.Matrix4, w = 16, h = 12) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(radii.x, radii.y, radii.z);
  g.applyMatrix4(basis);
  return g;
}

interface SharedEntry {
  set: ResourceSet;
  users: number;
  disposed: boolean;
}

// One build per builder, shared by every mounted user (e.g. both mirrored sides) and disposed after the
// last one unmounts. Disposal waits a microtask so a remount within the same commit keeps the set.
const shared = new Map<() => ResourceSet, SharedEntry>();

function sharedEntry(build: () => ResourceSet): SharedEntry {
  let entry = shared.get(build);
  if (!entry) {
    entry = { set: build(), users: 0, disposed: false };
    shared.set(build, entry);
  }
  return entry;
}

function useShared<T extends ResourceSet>(build: () => T): T {
  const [generation, rebuild] = useReducer((n: number) => n + 1, 0);
  const entry = useMemo(() => sharedEntry(build), [build, generation]);
  useEffect(() => {
    if (entry.disposed) {
      rebuild();
      return;
    }
    entry.users++;
    return () => {
      entry.users--;
      queueMicrotask(() => {
        if (entry.users > 0 || entry.disposed) return;
        entry.disposed = true;
        if (shared.get(build) === entry) shared.delete(build);
        for (const item of Object.values(entry.set)) item.dispose();
      });
    };
  }, [build, entry]);
  return entry.set as T;
}

function torsoInside(x: number, wy: number, z: number) {
  if (wy > TORSO_TOP || wy < TORSO_BOTTOM) return false;
  const r = torsoRadiusAt(wy);
  return x * x + (z / TORSO_DEPTH) ** 2 < r * r;
}

function torsoNormal(x: number, wy: number, z: number, out: Vec3) {
  const h = 0.002;
  const dr = (torsoRadiusAt(wy + h) - torsoRadiusAt(wy - h)) / (2 * h);
  return out.set(2 * x, -2 * torsoRadiusAt(wy) * dr, (2 * z) / (TORSO_DEPTH * TORSO_DEPTH)).normalize();
}

const chestNormal = (p: Vec3, out: Vec3) => torsoNormal(p.x, p.y + CHEST_Y, p.z, out);

function torsoHit(x: number, cy: number, beta: number, out: Vec3) {
  let lo = 0;
  let hi = 0.6;
  const sy = Math.sin(beta);
  const cz = Math.cos(beta);
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (torsoInside(x, cy + m * sy, m * cz)) lo = m;
    else hi = m;
  }
  return out.set(x, cy + lo * sy, lo * cz);
}

const FOOT_MID = 0.0715;
const FOOT_HALF = 0.1715;
const UPPER_BASE = -0.085;
const GROUND = -0.12;
const UPPER_W = [0.074, 0.08, 0.084, 0.085, 0.086, 0.089, 0.091, 0.087, 0.08];
const UPPER_H = [0.07, 0.07, 0.068, 0.066, 0.062, 0.057, 0.051, 0.046, 0.04];

const spring = (z: number) => (z > 0.1 ? 0.9 * (z - 0.1) ** 2 : 0);

function footFrame(t: number, medial: boolean) {
  const s = Math.sqrt(Math.max(0, 1 - t * t));
  const x01 = (t + 1) / 2;
  const heel = t < 0;
  const arch = medial ? 1 - 0.1 * Math.exp(-(((t + 0.05) / 0.3) ** 2)) : 1;
  const k = smooth(-0.6, 0.4, t);
  return {
    w: table(UPPER_W, x01) * Math.pow(s, heel ? 0.4 : 0.5) * arch,
    h: table(UPPER_H, x01) * Math.pow(s, heel ? 0.15 : 0.35),
    shift: -0.012 * smooth(0.3, 1, t),
    px: lerp(0.55, 0.85, k),
    py: lerp(0.45, 0.8, k),
    z: FOOT_MID + t * FOOT_HALF,
  };
}

// t: -1 heel .. 1 toe; psi: 0 = outer (+x) welt, PI/2 = top centre.
function upperPoint(t: number, psi: number, inflate: number, out: Vec3) {
  const c = Math.cos(psi);
  const s = Math.sin(psi);
  const f = footFrame(t, c < 0);
  const x = f.shift + spow(c, f.px) * f.w * inflate;
  const y = s >= 0 ? UPPER_BASE + Math.pow(s, f.py) * f.h * inflate : UPPER_BASE + s * 0.012;
  const z = f.z + t * (inflate - 1) * 0.1;
  return out.set(x, y + spring(z), z);
}

function upperTop(x: number, z: number) {
  const t = THREE.MathUtils.clamp((z - FOOT_MID) / FOOT_HALF, -0.999, 0.999);
  const f = footFrame(t, x < 0);
  const c = Math.pow(Math.min(1, Math.abs(x - f.shift) / f.w), 1 / f.px);
  return UPPER_BASE + Math.pow(Math.sqrt(Math.max(0, 1 - c * c)), f.py) * f.h + spring(z);
}

function soleOutline(offset: number) {
  const raw: THREE.Vector2[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const f = footFrame(-Math.cos((Math.PI * i) / n), false);
    raw.push(new THREE.Vector2(f.shift + f.w, -f.z));
  }
  for (let i = n - 1; i >= 1; i--) {
    const f = footFrame(-Math.cos((Math.PI * i) / n), true);
    raw.push(new THREE.Vector2(f.shift - f.w, -f.z));
  }
  let area = 0;
  raw.forEach((p, i) => {
    const q = raw[(i + 1) % raw.length];
    area += p.x * q.y - q.x * p.y;
  });
  const sign = area > 0 ? 1 : -1;
  return raw.map((p, i) => {
    const prev = raw[(i - 1 + raw.length) % raw.length];
    const next = raw[(i + 1) % raw.length];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    return new THREE.Vector2(p.x + (sign * ty * offset) / len, p.y - (sign * tx * offset) / len);
  });
}

function buildSole() {
  const shape = new THREE.Shape(soleOutline(0.004));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 4,
    curveSegments: 1,
    steps: 1,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, GROUND + 0.012, 0);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) + spring(pos.getZ(i)));
  const smoothG = toCreasedNormals(g, 0.7);
  g.dispose();
  return smoothG;
}

function foxingLine() {
  const pts = soleOutline(0.0125).map((p) => V(p.x, GROUND + 0.021 + spring(-p.y), -p.y));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 80, 0.0032, 4, true);
}

const onTop = (x: number, lift: number, z: number) => V(x, upperTop(x, z) + lift, z);

function laceTube(pts: Vec3[], r = 0.0042) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 8, r, 4, false);
}

function buildLaces() {
  const rows = [0.14, 0.26, 0.38, 0.5].map((t) => FOOT_MID + t * FOOT_HALF);
  const ex = 0.034;
  const out: THREE.BufferGeometry[] = [];
  const cross = (x1: number, z1: number, x2: number, z2: number, over: number) => {
    const mid = (a: number, b: number, k: number) => a + (b - a) * k;
    return laceTube([
      onTop(x1, 0.003, z1),
      onTop(mid(x1, x2, 0.25), 0.013 + over * 0.5, mid(z1, z2, 0.25)),
      onTop(0, 0.019 + over, mid(z1, z2, 0.5)),
      onTop(mid(x1, x2, 0.75), 0.013 + over * 0.5, mid(z1, z2, 0.75)),
      onTop(x2, 0.003, z2),
    ]);
  };
  const last = rows.length - 1;
  out.push(cross(-ex, rows[last], ex, rows[last], 0));
  for (let i = last; i > 0; i--) {
    out.push(cross(-ex, rows[i], ex, rows[i - 1], 0.004));
    out.push(cross(ex, rows[i], -ex, rows[i - 1], 0));
  }
  const z0 = rows[0];
  const c = onTop(0, 0.021, z0);
  for (const s of [-1, 1]) {
    out.push(
      laceTube([
        c,
        onTop(s * 0.014, 0.024, z0 - 0.006),
        onTop(s * 0.03, 0.021, z0 - 0.012),
        onTop(s * 0.04, 0.015, z0),
        onTop(s * 0.029, 0.019, z0 + 0.008),
        onTop(s * 0.01, 0.021, z0 + 0.003),
        c,
      ], 0.0038),
    );
    out.push(
      laceTube([c, onTop(s * 0.01, 0.017, z0 + 0.015), onTop(s * 0.018, 0.012, z0 + 0.03), onTop(s * 0.022, 0.009, z0 + 0.046)], 0.0036),
    );
  }
  out.push(ellipsoid(V(0.0075, 0.006, 0.0075), new THREE.Matrix4().makeTranslation(c.x, c.y, c.z), 12, 8));
  return out;
}

function buildSneaker() {
  const upper = patch(36, 24, (u, v, o) => upperPoint(Math.cos(Math.PI * u), v * TAU, 1, o));
  const toeTheta = Math.acos(0.4);
  const toeCap = patch(12, 24, (u, v, o) => {
    const t = Math.cos(toeTheta * u);
    upperPoint(t, v * TAU, 1 + 0.035 * smooth(0.4, 0.55, t), o);
    o.y = Math.min(o.y, UPPER_BASE + 0.024 + spring(o.z));
  });
  const heelTheta = Math.acos(-0.45);
  const heelCounter = patch(12, 24, (u, v, o) => {
    const t = Math.cos(lerp(heelTheta, Math.PI, u));
    upperPoint(t, v * TAU, 1 + 0.03 * smooth(-0.45, -0.6, t), o);
    o.y = Math.min(o.y, UPPER_BASE + 0.034 + 0.024 * smooth(-0.5, -0.95, t));
  });
  const stripe = patch(
    44,
    6,
    (u, v, o) => {
      const hw = 0.14 * Math.pow(Math.sin(Math.PI * u), 0.7) + 0.004;
      const psi = 0.3 + 0.5 * Math.pow(u, 1.2) + hw * (2 * v - 1);
      upperPoint(0.35 - 0.9 * u, psi, 1.018, o);
    },
    false,
  );
  const tonguePts = [
    onTop(0, -0.002, 0.158),
    onTop(0, 0.003, 0.125),
    onTop(0, 0.003, 0.1),
    V(0, -0.012, 0.09),
    V(0, 0.004, 0.087),
    V(0, 0.017, 0.085),
  ];
  const tongueUp = V(0, 0.7, 0.7).normalize();
  const tongue = band(tonguePts, (_, n) => n.copy(tongueUp), 0.028, 0.006, {
    segs: 14,
    lift: 0.006,
    exp: 0.5,
    width: (u) => domeEnd(u, 0.22),
  });
  const heelTab = band(
    [V(0, -0.06, -0.106), V(0, -0.035, -0.1045), V(0, -0.015, -0.1005), V(0, 0.0, -0.096), V(0, 0.008, -0.092)],
    (_, n) => n.set(0, 0, -1),
    0.019,
    0.005,
    { segs: 10, exp: 0.55, width: (u) => domeEnd(u, 0.3) },
  );

  const ringPts: Vec3[] = [];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * TAU;
    const x = 0.071 * Math.cos(a);
    const z = -0.008 + 0.074 * Math.sin(a);
    ringPts.push(V(x, upperTop(x, z) + 0.002, z));
  }
  const collar = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ringPts, true, 'centripetal'), 48, 0.012, 6, true);

  const sockProfile = new THREE.SplineCurve(
    [
      [0.048, 0.05],
      [0.056, 0.058],
      [0.064, 0.057],
      [0.068, 0.05],
      [0.067, 0.04],
      [0.065, 0.02],
      [0.064, -0.02],
      [0.063, -0.07],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
  ).getSpacedPoints(10);
  const sock = patch(10, 24, (u, v, o) => {
    const p = sockProfile[Math.round(u * 10)];
    const a = v * TAU;
    o.set(p.x * Math.cos(a), p.y, -p.x * Math.sin(a));
  });

  return {
    rubber: merge([buildSole(), toeCap, stripe, heelTab, ...buildLaces()]),
    upper: merge([upper, heelCounter, tongue, foxingLine()]),
    collar,
    sock,
  };
}

function sneakerMaterials() {
  return {
    rubber: new THREE.MeshStandardMaterial({ color: PALETTE.shoeWhite, roughness: 0.62 }),
    upper: new THREE.MeshPhysicalMaterial({
      color: PALETTE.shoeRed,
      roughness: 0.5,
      sheen: 0.35,
      sheenRoughness: 0.5,
      sheenColor: '#ff9a8a',
      clearcoat: 0.12,
      clearcoatRoughness: 0.6,
    }),
    collar: new THREE.MeshStandardMaterial({ color: LINING, roughness: 0.85 }),
    sock: new THREE.MeshPhysicalMaterial({
      color: PALETTE.sock,
      roughness: 0.95,
      sheen: 0.6,
      sheenRoughness: 0.6,
      sheenColor: '#ffffff',
    }),
  };
}

export function Sneaker({ side }: { side: Side }) {
  const g = useShared(buildSneaker);
  const m = useShared(sneakerMaterials);
  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={g.rubber} material={m.rubber} receiveShadow />
      <mesh geometry={g.upper} material={m.upper} castShadow receiveShadow />
      <mesh geometry={g.collar} material={m.collar} />
      <mesh geometry={g.sock} material={m.sock} receiveShadow />
    </group>
  );
}

const PALM_RX = [0.043, 0.036, 0.029, 0.026, 0.024];
const PALM_RZ = [0.044, 0.042, 0.045, 0.048, 0.047];

// Built for side = +1: back of hand +x, palm -x, thumb +z, fingers -y.
function palmPoint(u: number, v: number, out: Vec3) {
  const e =
    u < 0.12
      ? Math.sqrt(1 - ((0.12 - u) / 0.12) ** 2)
      : u > 0.84
        ? Math.sqrt(Math.max(0, 1 - ((u - 0.84) / 0.16) ** 2))
        : 1;
  const a = v * TAU;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const rx = table(PALM_RX, u) * e;
  const rz = table(PALM_RZ, u) * e;
  const x = c > 0 ? spow(c, 0.7) * rx * 0.95 : c * rx * 1.1;
  return out.set(x, 0.03 - 0.136 * u, -spow(s, 0.75) * rz);
}

const FINGERS: [number, number, number, number, number][] = [
  [0.033, 0.078, 0.0132, 0.05, 0.9],
  [0.011, 0.086, 0.0138, 0.01, 1.0],
  [-0.012, 0.08, 0.0132, -0.03, 1.1],
  [-0.033, 0.066, 0.0116, -0.07, 1.25],
];

function nail(curve: THREE.Curve<Vec3>, u: number, r: number, reach: number, back0: Vec3) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u);
  const b = back0.clone().addScaledVector(t, -back0.dot(t)).normalize();
  const s = V().crossVectors(t, b);
  const m = new THREE.Matrix4().makeBasis(s, t, b).setPosition(p.addScaledVector(b, r * reach));
  return ellipsoid(V(r * 0.72, r * 0.95, 0.0028), m, 8, 6);
}

function buildHand() {
  const skin: THREE.BufferGeometry[] = [patch(20, 16, palmPoint)];
  const nails: THREE.BufferGeometry[] = [];
  const back = V(1, 0, 0);
  for (const [z, len, r0, spread, curl] of FINGERS) {
    const y0 = -0.082 - 0.006 * (1 - (z / 0.04) ** 2);
    const p = V(-0.003, y0, z);
    const pts = [V(-0.001, y0 + 0.022, z), p.clone()];
    let ang = 0;
    for (const [f, bend] of [
      [0.45, 0.15],
      [0.3, 0.38],
      [0.25, 0.25],
    ]) {
      ang += bend * curl;
      p.add(V(-Math.sin(ang) * len * f, -Math.cos(ang) * len * f, spread * len * f));
      pts.push(p.clone());
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const cap = (r0 * 0.95) / curve.getLength();
    skin.push(taperTube(curve, (u) => r0 * (1 - 0.15 * u) * domeEnd(u, cap), 16, 8, 0.88));
    nails.push(nail(curve, 1 - cap * 1.5, r0 * 0.86, 0.78, back));
  }
  const thumb = new THREE.CatmullRomCurve3(
    [V(-0.008, -0.022, 0.02), V(-0.016, -0.045, 0.042), V(-0.024, -0.067, 0.052), V(-0.03, -0.088, 0.053), V(-0.033, -0.103, 0.049)],
    false,
    'centripetal',
  );
  const thumbCap = 0.0125 / thumb.getLength();
  skin.push(taperTube(thumb, (u) => table([0.021, 0.0175, 0.014, 0.0128, 0.0122], u) * domeEnd(u, thumbCap), 16, 8, 0.9));
  nails.push(nail(thumb, 1 - thumbCap * 1.5, 0.0122, 0.82, V(0.7, 0, 0.7).normalize()));
  return { skin: merge(skin), nails: merge(nails) };
}

function handMaterials() {
  return {
    skin: new THREE.MeshStandardMaterial({ color: PALETTE.skin, roughness: 0.66 }),
    nails: new THREE.MeshStandardMaterial({ color: NAIL, roughness: 0.35 }),
  };
}

export function Hand({ side }: { side: Side }) {
  const g = useShared(buildHand);
  const m = useShared(handMaterials);
  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={g.skin} material={m.skin} castShadow receiveShadow />
      <mesh geometry={g.nails} material={m.nails} />
    </group>
  );
}

const PACK_C = V(0, 0.12, -0.338);
const PACK_TILT = 0.1;
const PACK_A = 0.2;
const PACK_B = 0.22;
const PACK_D = 0.09;
const PACK_E1 = 0.3;
const PACK_E2 = 0.35;
const PACK_WRAP = 0.75;
const POCKET_C = V(0, -0.08, -0.1);

function superq(a: number, b: number, c: number, eta: number, om: number, out: Vec3) {
  const ce = Math.pow(Math.max(0, Math.cos(eta)), PACK_E1);
  return out.set(a * ce * spow(Math.cos(om), PACK_E2), b * spow(Math.sin(eta), PACK_E1), c * ce * spow(Math.sin(om), PACK_E2));
}

function puff(p: Vec3, a: number, b: number, c: number, k: number) {
  const fx = clamp01(1 - (p.x / a) ** 2);
  const fy = clamp01(1 - (p.y / b) ** 2);
  if (p.z < 0) p.z *= 1 + k * fx * fy;
  p.x *= 1 + 0.05 * fy * clamp01(1 - (p.z / c) ** 2);
  return p;
}

// Pack-local (+z toward the body) -> chest space, bent around the back.
function packToChest(p: Vec3) {
  const cs = Math.cos(PACK_TILT);
  const sn = Math.sin(PACK_TILT);
  p.set(p.x + PACK_C.x, p.y * cs - p.z * sn + PACK_C.y, p.y * sn + p.z * cs + PACK_C.z);
  const wy = Math.min(p.y, 0.2) + CHEST_Y;
  const r = torsoRadiusAt(wy);
  const ax = Math.min(Math.abs(p.x), r * 0.95);
  p.z += PACK_WRAP * (torsoSurfaceZ(wy) - TORSO_DEPTH * Math.sqrt(r * r - ax * ax));
  return p;
}

function hugBack(p: Vec3, gap: number) {
  const wy = p.y + CHEST_Y;
  if (wy < TORSO_BOTTOM || wy > TORSO_TOP) return p;
  const r = torsoRadiusAt(wy);
  if (Math.abs(p.x) >= r) return p;
  const lim = -TORSO_DEPTH * Math.sqrt(r * r - p.x * p.x) - gap;
  if (p.z > lim) p.z = lim;
  return p;
}

const bodyUV = (u: number, v: number, a: number, b: number, c: number, out: Vec3) =>
  superq(a, b, c, (u - 0.5) * Math.PI, (v - 0.5) * TAU, out);

function packSeam(z0: number) {
  const pts: Vec3[] = [];
  for (let k = 0; k < 56; k++) {
    const g = (k / 56) * TAU;
    let lo = 0;
    let hi = 0.3;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      const f =
        Math.pow(Math.abs((m * Math.cos(g)) / PACK_A) ** (2 / PACK_E2) + Math.abs(z0 / PACK_D) ** (2 / PACK_E2), PACK_E2 / PACK_E1) +
        Math.abs((m * Math.sin(g)) / PACK_B) ** (2 / PACK_E1);
      if (f < 1) lo = m;
      else hi = m;
    }
    pts.push(packToChest(puff(V(lo * Math.cos(g), lo * Math.sin(g), z0), PACK_A, PACK_B, PACK_D, 0.22)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 80, 0.0045, 4, true);
}

function strapPath(s: Side) {
  const pts: Vec3[] = [V(s * 0.115, 0.2, -0.265), V(s * 0.118, 0.265, -0.248)];
  const b0 = 2.2;
  const b1 = -0.59;
  const qTop = (b0 - Math.PI / 2) / (b0 - b1);
  const hit = V();
  const n = V();
  for (let i = 0; i <= 18; i++) {
    const q = i / 18;
    const x =
      q < qTop ? lerp(0.125, 0.18, smooth(0, 1, q / qTop)) : lerp(0.18, 0.15, smooth(0, 1, (q - qTop) / (1 - qTop)));
    torsoHit(s * x, 0.95, lerp(b0, b1, q), hit);
    torsoNormal(hit.x, hit.y, hit.z, n);
    pts.push(V(hit.x, hit.y - CHEST_Y, hit.z).addScaledVector(n, 0.0175));
  }
  return pts;
}

function buckle(curve: THREE.Curve<Vec3>, u: number) {
  const p = curve.getPointAt(u);
  const t = curve.getTangentAt(u);
  const n = chestNormal(p, V());
  const w = V().crossVectors(t, n).normalize();
  n.crossVectors(w, t).normalize();
  const loop: Vec3[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    loop.push(p.clone().addScaledVector(w, spow(Math.cos(a), 0.3) * 0.035).addScaledVector(n, spow(Math.sin(a), 0.3) * 0.013));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true, 'centripetal'), 24, 0.0035, 4, true);
}

function buildBackpack() {
  const body = patch(24, 32, (u, v, o) => {
    bodyUV(u, v, PACK_A, PACK_B, PACK_D, o);
    hugBack(packToChest(puff(o, PACK_A, PACK_B, PACK_D, 0.22)), 0.003);
  });
  const flap = patch(24, 32, (u, v, o) => {
    bodyUV(u, v, PACK_A + 0.012, PACK_B + 0.012, PACK_D + 0.012, o);
    const w = clamp01((o.z / (PACK_D + 0.012) + 0.2) / 0.9);
    o.y = Math.max(o.y, lerp(0.05 + 0.06 * (o.x / PACK_A) ** 2, 0.17, w));
    hugBack(packToChest(puff(o, PACK_A, PACK_B, PACK_D, 0.22)), 0.002);
  });
  const pocket = patch(18, 24, (u, v, o) => {
    bodyUV(u, v, 0.135, 0.085, 0.036, o);
    packToChest(puff(o, 0.135, 0.085, 0.036, 0.3).add(POCKET_C));
  });
  const zipPts: Vec3[] = [];
  for (let k = 0; k <= 22; k++) {
    const o = superq(0.139, 0.088, 0.039, 0.72, lerp(-Math.PI + 0.45, -0.45, k / 22), V());
    zipPts.push(packToChest(puff(o, 0.139, 0.088, 0.039, 0.3).add(POCKET_C)));
  }
  const zipper = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zipPts, false, 'centripetal'), 30, 0.0035, 4, false);
  const handleC = packToChest(V(0, 0.2, 0.03));
  const handle = band(
    [
      V(-0.058, 0.218, 0.03),
      V(-0.045, 0.245, 0.03),
      V(-0.02, 0.262, 0.03),
      V(0.02, 0.262, 0.03),
      V(0.045, 0.245, 0.03),
      V(0.058, 0.218, 0.03),
    ].map(packToChest),
    (p, n) => n.subVectors(p, handleC),
    0.011,
    0.0035,
    { segs: 16 },
  );

  const tilt = new THREE.Matrix4().makeRotationX(PACK_TILT);
  const snapAt = packToChest(V(0, 0.062, -0.1235));
  const snap = ellipsoid(V(0.016, 0.011, 0.0045), tilt.clone().setPosition(snapAt), 12, 8);
  const pullAt = zipPts[zipPts.length - 1].clone().add(V(0.004, -0.013, -0.004));
  const pull = ellipsoid(V(0.0055, 0.012, 0.0022), tilt.clone().setPosition(pullAt), 12, 8);

  const straps: THREE.BufferGeometry[] = [];
  const buckles: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1] as const) {
    const pts = strapPath(s);
    straps.push(band(pts, chestNormal, 0.0275, 0.0075, { segs: 36, width: (u) => domeEnd(u, 0.025) }));
    buckles.push(buckle(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 0.9));
  }

  return {
    body: merge([body, ...straps]),
    trim: merge([flap, pocket, zipper, handle, packSeam(-0.55 * PACK_D), packSeam(0)]),
    metal: merge([snap, pull, ...buckles]),
  };
}

export function Backpack() {
  const g = useShared(buildBackpack);
  return (
    <group>
      <mesh geometry={g.body} castShadow receiveShadow>
        <meshPhysicalMaterial color={PALETTE.pack} roughness={0.78} sheen={0.5} sheenRoughness={0.55} sheenColor="#ffb27a" />
      </mesh>
      <mesh geometry={g.trim} receiveShadow>
        <meshPhysicalMaterial color={PALETTE.packDark} roughness={0.8} sheen={0.4} sheenRoughness={0.6} sheenColor="#e08a55" />
      </mesh>
      <mesh geometry={g.metal}>
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

function buildCollar() {
  const pts: Vec3[] = [];
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * TAU;
    const wy = 1.195 - 0.011 * Math.max(0, Math.sin(a)) ** 2;
    const r = torsoRadiusAt(wy);
    pts.push(V(r * Math.cos(a), wy - CHEST_Y, TORSO_DEPTH * r * Math.sin(a)));
  }
  return {
    band: band(pts, chestNormal, 0.02, 0.0085, {
      closed: true,
      segs: 96,
      lift: 0.0045,
      exp: 0.7,
    }),
  };
}

export function Collar() {
  const g = useShared(buildCollar);
  return (
    <group>
      <mesh geometry={g.band} receiveShadow>
        <meshPhysicalMaterial color={PALETTE.shirtBlue} roughness={0.85} sheen={0.5} sheenRoughness={0.6} sheenColor="#9db8ff" />
      </mesh>
    </group>
  );
}

const SLEEVE_PROFILE = new THREE.SplineCurve(
  [
    [0, 0.074],
    [0.036, 0.071],
    [0.063, 0.058],
    [0.083, 0.036],
    [0.095, 0.008],
    [0.098, -0.035],
    [0.099, -0.085],
    [0.1, -0.113],
    [0.106, -0.12],
    [0.108, -0.132],
    [0.102, -0.141],
    [0.092, -0.139],
    [0.087, -0.125],
    [0.084, -0.095],
  ].map(([r, y]) => new THREE.Vector2(r, y)),
);

// Built for side = +1: the torso is toward -x.
function buildSleeve() {
  const prof = SLEEVE_PROFILE.getSpacedPoints(32);
  return {
    sleeve: patch(32, 32, (u, v, o) => {
      const p = prof[Math.round(u * 32)];
      const a = v * TAU;
      const r = p.x * (1 + 0.028 * Math.sin(3 * a + 0.8) * smooth(0, -0.1, p.y));
      const c = Math.cos(a);
      const yoke = c < 0 ? Math.pow(-c, 1.5) * smooth(-0.05, 0.06, p.y) * smooth(0, 0.08, p.x) : 0;
      const x = r * c * (1 + (c < 0 ? 0.2 * smooth(-0.14, 0.04, p.y) : 0) + 0.3 * yoke);
      o.set(x, p.y - 0.04 * yoke, -r * Math.sin(a) * 0.95);
    }),
  };
}

function sleeveMaterials() {
  return {
    sleeve: new THREE.MeshPhysicalMaterial({
      color: PALETTE.shirtBlue,
      roughness: 0.82,
      sheen: 0.5,
      sheenRoughness: 0.6,
      sheenColor: '#9db8ff',
    }),
  };
}

export function Sleeve({ side }: { side: Side }) {
  const g = useShared(buildSleeve);
  const m = useShared(sleeveMaterials);
  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={g.sleeve} material={m.sleeve} castShadow receiveShadow />
    </group>
  );
}
