'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PALETTE } from './spec';

type V3 = THREE.Vector3;
type Place = (u: V3, out: V3) => void;
type Paint = (u: V3, out: THREE.Color) => void;
type StrandPaint = (s: number, side: number, out: THREE.Color) => void;
type LockKind = 'lock' | 'bang' | 'spike' | 'burn';

interface LockSpec {
  root: V3;
  len: number;
  width: number;
  thick: number;
  lift: number;
  curl: number;
  gravity: number;
  kind: LockKind;
  heading?: V3;
  floor?: number;
}

interface LidSpec {
  r: number;
  theta: number;
  tilt: number;
  lower: boolean;
}

const vec = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const tone = (hex: string) => new THREE.Color(hex);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function sstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

function bump(d: V3, c: V3, sigma: number) {
  return Math.exp(-(1 - d.dot(c)) / (sigma * sigma));
}

function pair(d: V3, c: V3, sigma: number) {
  const mirrored = -d.x * c.x + d.y * c.y + d.z * c.z;
  return bump(d, c, sigma) + Math.exp(-(1 - mirrored) / (sigma * sigma));
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TONES = {
  skin: tone(PALETTE.skin),
  shade: tone(PALETTE.skinShade),
  light: tone(PALETTE.skinLight),
  blush: tone(PALETTE.skinLight).lerp(tone(PALETTE.lips), 0.35),
  lid: tone(PALETTE.skin).lerp(tone(PALETTE.skinShade), 0.45),
  lidRim: tone(PALETTE.skin).lerp(tone(PALETTE.skinLight), 0.3),
  lipLine: tone(PALETTE.lips).lerp(tone(PALETTE.pupil), 0.45),
  lowerLip: tone(PALETTE.skin).lerp(tone(PALETTE.lips), 0.5),
  nostril: tone(PALETTE.skinShade).lerp(tone(PALETTE.pupil), 0.6),
  earInner: tone(PALETTE.skinShade).lerp(tone(PALETTE.lips), 0.3),
  earRim: tone(PALETTE.skin).lerp(tone(PALETTE.lips), 0.12),
  neck: tone(PALETTE.skinShade).lerp(tone(PALETTE.skin), 0.35),
  hairRoot: tone(PALETTE.hair).multiplyScalar(0.75),
  hair: tone(PALETTE.hair),
  hairTip: tone(PALETTE.hair).lerp(tone(PALETTE.skinShade), 0.08),
  brow: tone(PALETTE.brow),
  lash: tone(PALETTE.brow).lerp(tone(PALETTE.pupil), 0.5),
};
const SKIN_SHEEN = tone(PALETTE.skinLight).lerp(tone(PALETTE.lips), 0.25);
const HAIR_SHEEN = tone(PALETTE.hair).lerp(tone(PALETTE.skinLight), 0.4);

const HEAD_C = vec(0, 0.36, 0);
const UP = vec(0, 1, 0);
const X_AXIS = vec(1, 0, 0);
const DIR = {
  eye: vec(0.34, 0.1, 0.93).normalize(),
  brow: vec(0.33, 0.37, 0.87).normalize(),
  cheek: vec(0.55, -0.3, 0.78).normalize(),
  temple: vec(0.85, 0.3, 0.42).normalize(),
  chin: vec(0, -0.62, 0.78).normalize(),
  muzzle: vec(0, -0.38, 0.92).normalize(),
  bridge: vec(0, 0.1, 1).normalize(),
  forehead: vec(0, 0.55, 0.83).normalize(),
  frontTop: vec(0, 0.85, 0.5).normalize(),
  part: vec(0, 0.93, 0.36).normalize(),
};
const PART_A = vec(1, 0, 0);
const PART_B = vec().crossVectors(DIR.part, PART_A);

const EYE_R = vec(0.068, 0.068, 0.05);
const EYE_YAW = 0.2;
const GAZE = -0.1;
const IRIS_ANGLE = 0.43;
const PUPIL_ANGLE = 0.19;
const LID_UP: LidSpec = { r: 1.075, theta: 1.26, tilt: -0.35, lower: false };
const LID_LO: LidSpec = { r: 1.055, theta: 1.23, tilt: 0.3, lower: true };
const EAR = { w: 0.045, h: 0.076, d: 0.052 };

// [azimuth from the face (rad), hairline elevation (rad)] around the skull; 0 = forehead, PI = nape.
const HAIRLINE: [number, number][] = [
  [0, 0.69],
  [0.35, 0.65],
  [0.6, 0.52],
  [0.85, 0.36],
  [1.05, 0.25],
  [1.25, 0.21],
  [1.57, 0.25],
  [1.75, 0.12],
  [1.95, -0.25],
  [2.3, -0.5],
  [2.7, -0.6],
  [Math.PI, -0.63],
];

function skullRadius(d: V3): number {
  const jaw = sstep(-0.1, -0.9, d.y);
  const a = 0.382 * (1 - 0.13 * jaw) * (1 + 0.035 * sstep(0.05, 0.6, d.y));
  const b = mix(0.35, 0.402, sstep(-0.3, 0.25, d.y));
  const back = 0.405 * (1 - 0.12 * sstep(-0.3, -0.9, d.y));
  const c = mix(back, 0.372, sstep(-0.35, 0.35, d.z));
  let r = 1 / Math.sqrt((d.x / a) ** 2 + (d.y / b) ** 2 + (d.z / c) ** 2);
  r += 0.018 * pair(d, DIR.cheek, 0.24);
  r -= 0.024 * pair(d, DIR.eye, 0.2);
  r += 0.009 * pair(d, DIR.brow, 0.13);
  r -= 0.006 * pair(d, DIR.temple, 0.25);
  r += 0.008 * bump(d, DIR.chin, 0.2);
  r += 0.01 * bump(d, DIR.muzzle, 0.2);
  r += 0.012 * bump(d, DIR.bridge, 0.1);
  return r;
}

function skullPoint(d: V3, extra = 0, out = vec()): V3 {
  return out.copy(d).multiplyScalar(skullRadius(d) + extra).add(HEAD_C);
}

function skullNormal(d: V3): V3 {
  const t1 = (Math.abs(d.y) < 0.9 ? UP.clone() : X_AXIS.clone()).cross(d).normalize();
  const t2 = d.clone().cross(t1).normalize();
  const p0 = skullPoint(d);
  const p1 = skullPoint(d.clone().addScaledVector(t1, 0.004).normalize()).sub(p0);
  const p2 = skullPoint(d.clone().addScaledVector(t2, 0.004).normalize()).sub(p0);
  const n = p1.cross(p2).normalize();
  return n.dot(d) < 0 ? n.negate() : n;
}

function faceDir(x: number, y: number): V3 {
  const ry = y - HEAD_C.y;
  const d = vec(x, ry, 0.35).normalize();
  for (let i = 0; i < 16; i++) {
    const r = skullRadius(d);
    d.set(x, ry, Math.sqrt(Math.max(1e-4, r * r - x * x - ry * ry))).normalize();
  }
  return d;
}

function onFace(x: number, y: number, lift = 0) {
  const d = faceDir(x, y);
  const n = skullNormal(d);
  return { p: skullPoint(d).addScaledVector(n, lift), n, d };
}

function hairlineAt(phi: number): number {
  const k = HAIRLINE;
  const last = k.length - 1;
  for (let i = 0; i < last; i++) {
    if (phi > k[i + 1][0]) continue;
    const t = (phi - k[i][0]) / (k[i + 1][0] - k[i][0]);
    const p0 = i === 0 ? k[1][1] : k[i - 1][1];
    const p1 = k[i][1];
    const p2 = k[i + 1][1];
    const p3 = i + 2 <= last ? k[i + 2][1] : k[last - 1][1];
    return (
      0.5 *
      (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t)
    );
  }
  return k[last][1];
}

function hairSigned(d: V3): number {
  const phi = Math.abs(Math.atan2(d.x, d.z));
  const wave = 0.035 * Math.sin(phi * 13 + 0.6) * sstep(1.05, 0.5, phi);
  return Math.asin(clamp(d.y, -1, 1)) - hairlineAt(phi) - wave;
}

function hairGroove(d: V3): number {
  const psi = Math.atan2(d.dot(PART_B), d.dot(PART_A));
  const ang = Math.acos(clamp(d.dot(DIR.part), -1, 1));
  return Math.sin(psi * 26 + 2.2 * Math.sin(ang * 5)) * sstep(0.12, 0.55, ang);
}

function hairThickness(d: V3): number {
  let t = 0.03 + 0.048 * sstep(0.1, 0.95, d.y);
  t += 0.014 * sstep(0.45, 0.9, Math.abs(d.x)) * sstep(-0.1, 0.45, d.y);
  t += 0.018 * sstep(0.2, -0.8, d.z) * sstep(-0.5, 0.3, d.y);
  t += 0.014 * bump(d, DIR.frontTop, 0.35);
  t +=
    0.004 *
    (Math.sin(9.1 * d.x + 3 * d.z + 1.3) + Math.sin(8.3 * d.y - 2.1 * d.x + 0.7) + Math.sin(7.7 * d.z + 4.1 * d.y));
  return t + 0.0045 * hairGroove(d);
}

function shellOffset(d: V3): number {
  return mix(-0.02, hairThickness(d), sstep(-0.035, 0.09, hairSigned(d)));
}

function latLong(
  ws: number,
  hs: number,
  place: Place,
  paint: Paint,
  exposed?: (u: V3) => boolean,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const vis: boolean[] = [];
  const u = vec();
  const p = vec();
  const c = new THREE.Color();
  const push = (theta: number, phi: number) => {
    u.set(Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi));
    place(u, p);
    paint(u, c);
    pos.push(p.x, p.y, p.z);
    col.push(c.r, c.g, c.b);
    vis.push(!exposed || exposed(u));
  };
  const tri = (a: number, b: number, cc: number) => {
    if (vis[a] || vis[b] || vis[cc]) idx.push(a, b, cc);
  };
  push(0, 0);
  for (let iy = 1; iy < hs; iy++) {
    for (let ix = 0; ix < ws; ix++) push((Math.PI * iy) / hs, (2 * Math.PI * ix) / ws);
  }
  push(Math.PI, 0);
  const at = (iy: number, ix: number) => 1 + (iy - 1) * ws + (ix % ws);
  const south = 1 + (hs - 1) * ws;
  for (let ix = 0; ix < ws; ix++) {
    tri(0, at(1, ix), at(1, ix + 1));
    for (let iy = 1; iy < hs - 1; iy++) {
      const a = at(iy, ix);
      const b = at(iy, ix + 1);
      const cc = at(iy + 1, ix);
      const dd = at(iy + 1, ix + 1);
      tri(a, cc, b);
      tri(b, cc, dd);
    }
    tri(at(hs - 1, ix), south, at(hs - 1, ix + 1));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function strand(
  pts: V3[],
  ups: V3[],
  width: (s: number) => number,
  thick: (s: number) => number,
  paint: StrandPaint,
  under = 0.4,
  radial = 8,
): THREE.BufferGeometry {
  const n = pts.length;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const T = vec();
  const U = vec();
  const S = vec();
  const q = vec();
  const c = new THREE.Color();
  const ends: V3[] = [];
  for (let i = 0; i < n; i++) {
    const s = n > 1 ? i / (n - 1) : 0;
    T.subVectors(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
    U.copy(ups[i]).addScaledVector(T, -ups[i].dot(T)).normalize();
    S.crossVectors(T, U);
    const w = width(s);
    const h = thick(s);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial + 0.25) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      q.copy(pts[i])
        .addScaledVector(S, ca * w)
        .addScaledVector(U, sa * h * (sa < 0 ? under : 1));
      pos.push(q.x, q.y, q.z);
      paint(s, sa, c);
      col.push(c.r, c.g, c.b);
    }
    if (i === 0) ends.push(pts[0].clone().addScaledVector(T, -0.45 * w));
    if (i === n - 1) ends.push(pts[i].clone().addScaledVector(T, 0.45 * w));
  }
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      idx.push(a, a + radial, b, b, a + radial, b + radial);
    }
  }
  const start = n * radial;
  const end = start + 1;
  ends.forEach((e, k) => {
    pos.push(e.x, e.y, e.z);
    paint(k, 1, c);
    col.push(c.r, c.g, c.b);
  });
  const last = (n - 1) * radial;
  for (let j = 0; j < radial; j++) {
    const j1 = (j + 1) % radial;
    idx.push(j, j1, start);
    idx.push(last + j, end, last + j1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function solid(g: THREE.BufferGeometry, c: THREE.Color): THREE.BufferGeometry {
  g.deleteAttribute('uv');
  const count = g.attributes.position.count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) arr.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

function mirrorX(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const m = g.clone();
  m.scale(-1, 1, 1);
  const index = m.getIndex();
  if (index) {
    const a = index.array as Uint16Array | Uint32Array;
    for (let i = 0; i < a.length; i += 3) {
      const t = a[i + 1];
      a[i + 1] = a[i + 2];
      a[i + 2] = t;
    }
    index.needsUpdate = true;
  }
  return m;
}

function merge(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = mergeGeometries(list, false);
  list.forEach((g) => g.dispose());
  if (!out) throw new Error('Head: failed to merge geometries');
  return out;
}

function withMirror(g: THREE.BufferGeometry): THREE.BufferGeometry[] {
  return [g, mirrorX(g)];
}

const uniform = (c: THREE.Color): StrandPaint => (_s, _side, out) => {
  out.copy(c);
};

function buildSkull(): THREE.BufferGeometry {
  return latLong(
    64,
    48,
    (u, out) => {
      skullPoint(u, 0, out);
    },
    (u, c) => {
      c.copy(TONES.skin)
        .lerp(TONES.blush, 0.5 * clamp(pair(u, DIR.cheek, 0.16)))
        .lerp(
          TONES.light,
          clamp(0.35 * bump(u, DIR.forehead, 0.3) + 0.3 * bump(u, DIR.bridge, 0.1) + 0.3 * bump(u, DIR.chin, 0.12)),
        )
        .lerp(TONES.shade, clamp(0.5 * pair(u, DIR.eye, 0.13) + 0.65 * sstep(-0.45, -0.92, u.y)));
    },
    (u) => hairSigned(u) < 0.12,
  );
}

function buildNeck(): THREE.BufferGeometry {
  const profile: [number, number][] = [
    [0, -0.09],
    [0.066, -0.088],
    [0.079, -0.075],
    [0.078, -0.03],
    [0.074, 0.03],
    [0.075, 0.09],
    [0.083, 0.14],
    [0.07, 0.19],
    [0, 0.21],
  ];
  const g = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    16,
  );
  g.scale(1, 1, 0.9);
  g.translate(0, 0, -0.015);
  return solid(g, TONES.neck);
}

function buildNose(): THREE.BufferGeometry {
  const { p, n } = onFace(0, 0.32);
  const center = p.addScaledVector(n, -0.016);
  const tip = vec(0, -0.2, 1).normalize();
  const ala = vec(0.75, -0.55, 0.4).normalize();
  const nostril = vec(0.42, -0.86, 0.3).normalize();
  return latLong(
    20,
    16,
    (u, out) => {
      const wide = 1 + 0.38 * sstep(0.2, -0.7, u.y) - 0.2 * sstep(0.1, 0.95, u.y);
      const t = bump(u, tip, 0.55);
      const al = pair(u, ala, 0.26);
      const ky = mix(0.034, 0.042, sstep(-0.3, 0.3, u.y));
      out
        .set(u.x * 0.032 * wide * (1 + 0.3 * al), u.y * ky - 0.004 * t, u.z * 0.04 * (1 + 0.42 * t))
        .addScaledVector(u, -0.006 * pair(u, nostril, 0.2))
        .add(center);
    },
    (u, c) => {
      c.copy(TONES.skin)
        .lerp(TONES.light, 0.4 * bump(u, tip, 0.35))
        .lerp(TONES.nostril, 0.85 * sstep(0.25, 0.7, pair(u, nostril, 0.16)));
    },
  );
}

function buildMouth(): THREE.BufferGeometry[] {
  const pts: V3[] = [];
  const ups: V3[] = [];
  for (let i = 0; i <= 18; i++) {
    const t = (i / 18) * 2 - 1;
    const { p, n } = onFace(0.056 * t, 0.208 + 0.016 * t * t + 0.008 * t ** 4, 0.0006);
    pts.push(p);
    ups.push(n);
  }
  const line = strand(
    pts,
    ups,
    (s) => 0.0048 * (1 - 0.5 * (2 * s - 1) ** 2) + 0.0012,
    () => 0.0022,
    uniform(TONES.lipLine),
    1,
  );

  const { p, n } = onFace(0, 0.19);
  const center = p.addScaledVector(n, -0.006);
  const q = new THREE.Quaternion().setFromUnitVectors(vec(0, 0, 1), n);
  const lip = latLong(
    10,
    6,
    (u, out) => {
      out
        .set(u.x * 0.034, u.y * 0.011 + 0.009 * u.x * u.x, u.z * 0.013)
        .applyQuaternion(q)
        .add(center);
    },
    (u, c) => {
      c.copy(TONES.lowerLip).lerp(TONES.lipLine, 0.35 * sstep(0.2, 0.9, u.y));
    },
  );
  return [line, lip];
}

function buildEar(): THREE.BufferGeometry {
  const shapeX = (uy: number) => EAR.w * (0.92 + 0.14 * sstep(-1, 1, uy));
  const bowlAt = (u: V3) => {
    const bx = (u.x + 0.2) / 0.62;
    const by = (u.y + 0.1) / 0.72;
    return Math.max(0, 1 - bx * bx - by * by) ** 2 * (1 - sstep(-0.35, -0.85, u.y));
  };
  const body = latLong(
    16,
    12,
    (u, out) => {
      const lobe = sstep(-0.35, -0.85, u.y);
      const z = u.z >= 0 ? u.z * 0.5 - 0.72 * bowlAt(u) : u.z * 0.34;
      out.set(u.x * shapeX(u.y) - 0.006 * lobe, u.y * EAR.h, z * EAR.d);
    },
    (u, c) => {
      c.copy(TONES.earRim).lerp(TONES.earInner, u.z > 0 ? clamp(1.6 * bowlAt(u)) : 0);
    },
  );

  const ctl = [
    [-0.2, 0.0, -0.1],
    [-0.5, 0.42, 0.3],
    [-0.42, 0.83, 0.25],
    [0, 0.95, 0.2],
    [0.5, 0.83, 0.2],
    [0.86, 0.42, 0.2],
    [0.92, -0.08, 0.2],
    [0.72, -0.5, 0.2],
    [0.38, -0.76, 0.2],
  ].map(([x, y, z]) => vec(x * shapeX(y), y * EAR.h, z * EAR.d));
  const rimPts = new THREE.CatmullRomCurve3(ctl).getPoints(20);
  const rimR = (s: number) => 0.0035 + 0.0055 * sstep(0, 0.3, s) * (1 - sstep(0.7, 1, s));
  const rim = strand(
    rimPts,
    rimPts.map(() => vec(0, 0, 1)),
    rimR,
    rimR,
    uniform(TONES.earRim),
    1,
    5,
  );

  const tragus = latLong(
    6,
    5,
    (u, out) => {
      out.set(-0.72 * EAR.w + u.x * 0.009, -0.2 * EAR.h + u.y * 0.012, 0.012 + u.z * 0.008);
    },
    (_u, c) => {
      c.copy(TONES.earRim);
    },
  );

  const ear = merge([body, rim, tragus]);
  const d = vec(1, (0.355 - HEAD_C.y) / 0.38, -0.05).normalize();
  const X = vec(0.35, 0, -1).normalize();
  const Z = vec(1, 0, 0.35).normalize();
  const origin = skullPoint(d).addScaledVector(X, 0.03).addScaledVector(Z, 0.01);
  const m = new THREE.Matrix4()
    .makeBasis(X, UP, Z)
    .setPosition(origin)
    .multiply(new THREE.Matrix4().makeRotationZ(-0.18));
  ear.applyMatrix4(m);
  return ear;
}

function eyeFrame(side: number) {
  const P = skullPoint(faceDir(0.13 * side, 0.4));
  const yaw = EYE_YAW * side;
  const F = vec(Math.sin(yaw), 0, Math.cos(yaw));
  const X = vec().crossVectors(UP, F).normalize();
  const Y = vec().crossVectors(F, X);
  const E = P.addScaledVector(F, -(EYE_R.z - 0.022));
  const matrix = new THREE.Matrix4()
    .makeBasis(X, Y, F)
    .setPosition(E)
    .multiply(new THREE.Matrix4().makeScale(EYE_R.x, EYE_R.y, EYE_R.z));
  return { matrix, E, X, Y, F };
}

function buildEyeball(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 24, 16);
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const v = vec();
  const h = vec();
  const eTheta = vec();
  const k = 0.07;
  const tc = 0.55;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const th = Math.acos(clamp(v.y, -1, 1));
    const f = th < tc ? (1 - (th / tc) ** 2) ** 2 : 0;
    const df = th < tc ? 2 * (1 - (th / tc) ** 2) * ((-2 * th) / (tc * tc)) : 0;
    const r = 1 + k * f;
    h.set(v.x, 0, v.z);
    if (h.lengthSq() > 1e-10) h.normalize();
    eTheta.copy(h).multiplyScalar(Math.cos(th)).add(vec(0, -Math.sin(th), 0));
    const n = v.clone().addScaledVector(eTheta, (-k * df) / r).normalize();
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r);
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  g.rotateX(Math.PI / 2);
  g.rotateY(GAZE);
  return g;
}

function lidEdge(lid: LidSpec, psi0: number, psi1: number, count: number, scale: number): V3[] {
  const th = lid.lower ? Math.PI - lid.theta : lid.theta;
  const out: V3[] = [];
  for (let i = 0; i < count; i++) {
    const psi = mix(psi0, psi1, i / (count - 1));
    out.push(
      vec(Math.sin(th) * Math.sin(psi), Math.cos(th), Math.sin(th) * Math.cos(psi))
        .multiplyScalar(lid.r * scale)
        .applyAxisAngle(X_AXIS, lid.tilt),
    );
  }
  return out;
}

function lidShell(lid: LidSpec): THREE.BufferGeometry {
  const g = lid.lower
    ? new THREE.SphereGeometry(lid.r, 24, 6, 0, Math.PI * 2, Math.PI - lid.theta, lid.theta)
    : new THREE.SphereGeometry(lid.r, 24, 8, 0, Math.PI * 2, 0, lid.theta);
  g.rotateX(lid.tilt);
  return solid(g, lid.lower ? TONES.skin : TONES.lid);
}

function buildEyes() {
  const { matrix } = eyeFrame(1);

  const ball = buildEyeball().applyMatrix4(matrix);

  const lash = lidEdge(LID_UP, -1.2, 1.3, 26, 1.02);
  const lashGeo = strand(
    lash,
    lash.map((p) => p.clone().normalize()),
    (s) => (0.07 + 0.06 * s * s) * (0.35 + 0.65 * sstep(0, 0.15, s)) * (0.3 + 0.7 * sstep(1, 0.8, s)),
    () => 0.045,
    uniform(TONES.lash),
    1,
  ).applyMatrix4(matrix);

  const rimPts = lidEdge(LID_LO, -1.1, 1.2, 20, 1.0);
  const lowerRim = strand(
    rimPts,
    rimPts.map((p) => p.clone().normalize()),
    (s) => 0.035 * (0.4 + 0.6 * Math.sin(Math.PI * s)),
    () => 0.035,
    uniform(TONES.lidRim),
    1,
  );
  const lids = merge([lidShell(LID_UP), lidShell(LID_LO), lowerRim]).applyMatrix4(matrix);

  return {
    balls: withMirror(ball),
    lids: withMirror(lids),
    lashes: withMirror(lashGeo),
  };
}

function buildGlints(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [1, -1]) {
    const { E, X, Y, F } = eyeFrame(side);
    const yaw = side * (EYE_YAW + GAZE);
    const gaze = vec(Math.sin(yaw), 0, Math.cos(yaw));
    const spots: [number, number, number][] = [
      [0.2, 0.22, 0.0068],
      [-0.13, -0.15, 0.0032],
    ];
    for (const [ox, oy, radius] of spots) {
      const u = gaze.clone().add(vec(ox, oy, 0)).normalize();
      const local = vec(u.dot(X) / EYE_R.x, u.dot(Y) / EYE_R.y, u.dot(F) / EYE_R.z);
      const at = E.clone().addScaledVector(u, 1.045 / local.length());
      const s = new THREE.SphereGeometry(radius, 8, 6);
      s.translate(at.x, at.y, at.z);
      parts.push(s);
    }
  }
  return merge(parts);
}

function buildBrow(): THREE.BufferGeometry {
  const pts: V3[] = [];
  const ups: V3[] = [];
  const count = 16;
  const thick = (s: number) => 0.0055 * (1 - 0.45 * s);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = 0.06 + 0.148 * t;
    const y = 0.502 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.12)) - 0.014 * t;
    const { p, n } = onFace(x, y, thick(t) * 0.4 + 0.001);
    pts.push(p);
    ups.push(n);
  }
  return strand(
    pts,
    ups,
    (s) => 0.0125 * (1 - s ** 1.8) * (0.6 + 0.4 * sstep(0, 0.15, s)) + 0.0015,
    thick,
    (s, side, out) => {
      out.copy(TONES.brow).multiplyScalar(side < 0 ? 0.7 : 1 + 0.25 * s);
    },
    0.4,
  );
}

function buildHairShell(): THREE.BufferGeometry {
  return latLong(
    96,
    72,
    (u, out) => {
      skullPoint(u, shellOffset(u), out);
    },
    (u, c) => {
      c.copy(TONES.hairRoot).lerp(TONES.hair, 0.5 + 0.5 * hairGroove(u));
    },
    (u) => hairSigned(u) > -0.05,
  );
}

function lockBlocked(p: V3, d: V3, L: LockSpec): boolean {
  const ax = Math.abs(p.x);
  if (p.y < 0.13) return true;
  if (L.kind === 'burn') return p.y < 0.35;
  const floor = Math.max(0.555, L.floor ?? 0.555);
  if (p.z > 0.1 && p.y < mix(floor, 0.47, sstep(0.2, 0.3, ax))) return true;
  if (ax > 0.25 && p.z > -0.17 && p.z < 0.15 && p.y < 0.475) return true;
  return hairSigned(d) < (L.kind === 'bang' ? -0.3 : -0.05);
}

function growLock(L: LockSpec): { pts: V3[]; ups: V3[] } {
  const steps = 14;
  const d = L.root.clone();
  const pts: V3[] = [];
  const ups: V3[] = [];
  const flow = vec();
  const grav = vec();
  const dir = vec();
  let heading: V3 | null = null;
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const rise = mix(-0.012, L.thick * 0.25, sstep(0, 0.22, s)) + L.lift * s * s;
    const r = skullRadius(d) + Math.max(shellOffset(d), 0.004) + rise;
    const p = d.clone().multiplyScalar(r).add(HEAD_C);
    if (i > 1 && lockBlocked(p, d, L)) break;
    pts.push(p);
    ups.push(d.clone());

    flow.copy(d).multiplyScalar(d.dot(DIR.part)).sub(DIR.part);
    if (flow.lengthSq() < 0.0025) flow.copy(L.heading ?? vec(0, 0, -1));
    flow.addScaledVector(d, -flow.dot(d)).normalize();
    grav.set(0, -1, 0).addScaledVector(d, d.y);
    if (grav.lengthSq() > 1e-6) grav.normalize();
    const gw = L.kind === 'burn' ? 1 : L.gravity * (L.kind === 'bang' ? 1 : sstep(0.55, -0.1, d.y));
    dir.copy(flow).multiplyScalar(1 - gw).addScaledVector(grav, gw);
    if (L.heading && i === 0) dir.lerp(L.heading, 0.5);
    dir.applyAxisAngle(d, L.curl * (0.3 + s));
    dir.addScaledVector(d, -dir.dot(d)).normalize();
    if (heading) {
      heading.lerp(dir, 0.45);
      heading.addScaledVector(d, -heading.dot(d)).normalize();
    } else {
      heading = dir.clone();
    }
    d.addScaledVector(heading, (L.len / steps) / r).normalize();
  }
  return { pts, ups };
}

function lockSpecs(): LockSpec[] {
  const rand = mulberry32(20240923);
  const jitter = (a: number) => (rand() - 0.5) * a;
  const fromAngles = (phi: number, e: number) =>
    vec(Math.cos(e) * Math.sin(phi), Math.sin(e), Math.cos(e) * Math.cos(phi));
  const specs: LockSpec[] = [];

  const N = 170;
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const ring = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    const root = vec(ring * Math.sin(a) + jitter(0.1), y + jitter(0.1), ring * Math.cos(a) + jitter(0.1)).normalize();
    const upper = root.y > 0.1;
    const skip = rand() < (upper ? 0.3 : 0.6);
    if (skip || hairSigned(root) < 0.12 || root.y < -0.5) continue;
    const top = sstep(0.1, 0.8, root.y);
    specs.push({
      root,
      len: upper ? mix(0.16, 0.26, top) * (0.8 + 0.4 * rand()) : 0.09 + 0.05 * rand(),
      width: upper ? 0.05 + 0.035 * rand() : 0.04 + 0.02 * rand(),
      thick: 0.016 + 0.012 * rand(),
      lift: upper ? (0.006 + 0.02 * rand()) * (0.6 + top) : 0.004 + 0.01 * rand(),
      curl: jitter(0.9),
      gravity: root.z > 0.25 && root.y > 0.5 ? 0.55 : mix(0.9, 0.3, top),
      kind: root.z > 0.25 && root.y > 0.5 ? 'bang' : 'lock',
      floor: 0.575 + 0.05 * rand(),
    });
  }

  for (let k = 0; k < 6; k++) {
    const phi = mix(-0.9, 0.9, k / 5) + jitter(0.25);
    const root = fromAngles(Math.PI + phi, 1.22 + 0.2 * rand());
    const heading = vec(Math.sin(phi) * 0.6, 0.2, -1).normalize();
    specs.push({
      root,
      heading,
      len: 0.1 + 0.06 * rand(),
      width: 0.038 + 0.02 * rand(),
      thick: 0.018,
      lift: 0.035 + 0.035 * rand(),
      curl: jitter(0.8),
      gravity: 0.1,
      kind: 'spike',
    });
  }

  for (let k = 0; k < 9; k++) {
    const phi = mix(-0.6, 0.6, k / 8) + jitter(0.08);
    specs.push({
      root: fromAngles(phi, 0.98 + 0.14 * rand()),
      len: (k % 2 ? 0.17 : 0.24) + 0.05 * rand(),
      width: 0.048 + 0.02 * rand(),
      thick: 0.02,
      lift: 0.012 + 0.012 * rand(),
      curl: 0.15 + jitter(0.4),
      gravity: 0.7,
      kind: 'bang',
      floor: 0.555 + 0.045 * rand() * rand(),
    });
  }

  for (const side of [1, -1]) {
    specs.push({
      root: fromAngles(1.24 * side, 0.3),
      len: 0.1,
      width: 0.03,
      thick: 0.01,
      lift: 0,
      curl: 0,
      gravity: 1,
      kind: 'burn',
    });
  }
  return specs;
}

function buildLocks(): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  for (const L of lockSpecs()) {
    const { pts, ups } = growLock(L);
    if (pts.length < 4) continue;
    const taper = (s: number) =>
      L.kind === 'burn' ? 1 - 0.35 * s : Math.pow(1 - s, 0.8) * (0.72 + 0.28 * sstep(0, 0.3, s));
    out.push(
      strand(
        pts,
        ups,
        (s) => L.width * taper(s) + 0.0008,
        (s) => L.thick * taper(s) + 0.0006,
        (s, side, c) => {
          c.copy(TONES.hairRoot)
            .lerp(TONES.hairTip, s ** 1.4)
            .multiplyScalar(side < 0 ? 0.7 : 1);
        },
        0.4,
        5,
      ),
    );
  }
  return out;
}

function buildHead() {
  const eyes = buildEyes();
  const skin = merge([
    buildSkull(),
    buildNeck(),
    buildNose(),
    ...buildMouth(),
    ...withMirror(buildEar()),
    ...eyes.lids,
  ]);
  const hair = merge([buildHairShell(), ...buildLocks(), ...withMirror(buildBrow()), ...eyes.lashes]);
  return { skin, hair, eyes: merge(eyes.balls), glints: buildGlints() };
}

function makeEyeTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const row = (theta: number) => (theta / Math.PI) * H;
  const css = (c: THREE.Color) => c.getStyle();
  const white = tone(PALETTE.eyeWhite);
  const iris = tone(PALETTE.iris);

  const sclera = ctx.createLinearGradient(0, 0, 0, H);
  sclera.addColorStop(0, PALETTE.eyeWhite);
  sclera.addColorStop(0.22, PALETTE.eyeWhite);
  sclera.addColorStop(0.36, css(white.clone().lerp(tone(PALETTE.skinLight), 0.12)));
  sclera.addColorStop(1, css(white.clone().lerp(tone(PALETTE.skinShade), 0.35)));
  ctx.fillStyle = sclera;
  ctx.fillRect(0, 0, W, H);

  const pupilEdge = row(PUPIL_ANGLE);
  const irisEdge = row(IRIS_ANGLE);
  const band = ctx.createLinearGradient(0, pupilEdge, 0, irisEdge);
  band.addColorStop(0, css(iris.clone().multiplyScalar(0.55)));
  band.addColorStop(0.3, PALETTE.iris);
  band.addColorStop(0.72, css(iris.clone().lerp(tone(PALETTE.skinLight), 0.35)));
  band.addColorStop(0.9, PALETTE.iris);
  band.addColorStop(1, css(iris.clone().lerp(tone(PALETTE.pupil), 0.7)));
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, irisEdge);

  const rand = mulberry32(11);
  for (let x = 0; x < W; x += 1.5) {
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,214,160,0.16)' : 'rgba(20,10,5,0.22)';
    ctx.lineWidth = 0.6 + rand();
    ctx.beginPath();
    ctx.moveTo(x, pupilEdge + rand() * 4);
    ctx.lineTo(x + (rand() - 0.5) * 3, irisEdge - 2 - rand() * 8);
    ctx.stroke();
  }

  const limbus = ctx.createLinearGradient(0, irisEdge - 2, 0, irisEdge + 4);
  limbus.addColorStop(0, 'rgba(0,0,0,0)');
  limbus.addColorStop(0.35, css(iris.clone().lerp(tone(PALETTE.pupil), 0.6)));
  limbus.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = limbus;
  ctx.fillRect(0, irisEdge - 2, W, 6);

  ctx.fillStyle = PALETTE.pupil;
  ctx.fillRect(0, 0, W, pupilEdge);
  const soft = ctx.createLinearGradient(0, pupilEdge - 1, 0, pupilEdge + 3);
  soft.addColorStop(0, PALETTE.pupil);
  soft.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = soft;
  ctx.fillRect(0, pupilEdge - 1, W, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function Head(): JSX.Element {
  const parts = useMemo(buildHead, []);
  const eyeMap = useMemo(makeEyeTexture, []);

  useEffect(
    () => () => {
      parts.skin.dispose();
      parts.hair.dispose();
      parts.eyes.dispose();
      parts.glints.dispose();
    },
    [parts],
  );
  useEffect(() => () => eyeMap.dispose(), [eyeMap]);

  return (
    <group>
      <mesh geometry={parts.skin} castShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.6}
          sheen={0.45}
          sheenRoughness={0.55}
          sheenColor={SKIN_SHEEN}
        />
      </mesh>
      <mesh geometry={parts.hair} castShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.46}
          sheen={0.9}
          sheenRoughness={0.32}
          sheenColor={HAIR_SHEEN}
        />
      </mesh>
      <mesh geometry={parts.eyes}>
        <meshPhysicalMaterial map={eyeMap} roughness={0.32} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh geometry={parts.glints}>
        <meshBasicMaterial color={PALETTE.eyeWhite} toneMapped={false} />
      </mesh>
    </group>
  );
}
