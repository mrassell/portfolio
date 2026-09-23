import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createStripeTexture } from '../textures';
import {
  CHEST_Y,
  FOREARM,
  HIP_X,
  HIP_Y,
  NECK_Y,
  PALETTE,
  SHIN,
  SHOULDER_SPLAY,
  SHOULDER_X,
  SHOULDER_Y,
  THIGH,
  TORSO_DEPTH,
  TORSO_PROFILE,
  TORSO_Y,
  UPPER_ARM,
} from './spec';

export const BONE_NAMES = [
  'root',
  'body',
  'torso',
  'chest',
  'head',
  'leftHip',
  'leftKnee',
  'leftAnkle',
  'rightHip',
  'rightKnee',
  'rightAnkle',
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
] as const;

export type BoneName = (typeof BONE_NAMES)[number];

export interface BuiltCharacter {
  group: THREE.Group;
  bones: Record<BoneName, THREE.Bone>;
  dispose: () => void;
}

// Surfaces of revolution, listed bottom -> top so lathe faces point outward. [radius, y] in the bone's local space.
const LEG_PROFILE: [number, number][] = [
  [0.05, -(THIGH + SHIN)],
  [0.052, -0.46],
  [0.062, -0.4],
  [0.073, -0.35],
  [0.071, -0.3],
  [0.067, -THIGH],
  [0.071, -0.24],
  [0.083, -0.16],
  [0.093, -0.08],
  [0.1, 0],
  [0.098, 0.04],
];

const ARM_PROFILE: [number, number][] = [
  [0.046, -(UPPER_ARM + FOREARM)],
  [0.05, -0.47],
  [0.058, -0.41],
  [0.06, -0.35],
  [0.055, -0.29],
  [0.053, -UPPER_ARM],
  [0.057, -0.22],
  [0.063, -0.14],
  [0.067, -0.06],
  [0.068, 0.02],
  [0.058, 0.055],
];

const PELVIS_PROFILE: [number, number][] = [
  [0.001, 0.5],
  [0.235, 0.5],
  [0.283, 0.56],
  [0.295, 0.64],
  [0.29, 0.74],
  [0.276, 0.84],
  [0.262, 0.88],
];

const SHORTS_LEG_PROFILE: [number, number][] = [
  [0.121, -0.175],
  [0.134, -0.17],
  [0.136, -0.155],
  [0.131, -0.145],
  [0.13, -0.06],
  [0.128, 0.03],
];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lathe(profile: [number, number][], segments: number) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

type WeightFn = (x: number, y: number, z: number) => [number, number, number];

function applySkin(geometry: THREE.BufferGeometry, weight: WeightFn) {
  const pos = geometry.attributes.position;
  const indices = new Uint16Array(pos.count * 4);
  const weights = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const [a, b, wb] = weight(pos.getX(i), pos.getY(i), pos.getZ(i));
    indices[i * 4] = a;
    indices[i * 4 + 1] = b;
    weights[i * 4] = 1 - wb;
    weights[i * 4 + 1] = wb;
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
}

function bulgeBack(geometry: THREE.BufferGeometry, centerY: number, width: number, amount: number) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (z >= 0 || r < 1e-4) continue;
    const push = amount * Math.exp(-(((y - centerY) / width) ** 2)) * (-z / r);
    const k = (r + push) / r;
    pos.setXYZ(i, x * k, y, z * k);
  }
}

function createSkeleton() {
  const bones = {} as Record<BoneName, THREE.Bone>;
  const make = (name: BoneName, parent: THREE.Bone | null, x: number, y: number, z: number) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(x, y, z);
    bone.userData.restY = y;
    parent?.add(bone);
    bones[name] = bone;
    return bone;
  };

  const root = make('root', null, 0, 0, 0);
  const body = make('body', root, 0, 0, 0);
  const torso = make('torso', body, 0, TORSO_Y, 0);
  const chest = make('chest', torso, 0, CHEST_Y - TORSO_Y, 0);
  make('head', chest, 0, NECK_Y - CHEST_Y, 0);

  for (const side of [-1, 1] as const) {
    const prefix = side === -1 ? 'left' : 'right';
    const hip = make(`${prefix}Hip`, body, side * HIP_X, HIP_Y, 0);
    const knee = make(`${prefix}Knee`, hip, 0, -THIGH, 0);
    make(`${prefix}Ankle`, knee, 0, -SHIN, 0);

    const shoulder = make(`${prefix}Shoulder`, chest, side * SHOULDER_X, SHOULDER_Y - CHEST_Y, 0);
    shoulder.rotation.z = SHOULDER_SPLAY * side;
    const elbow = make(`${prefix}Elbow`, shoulder, 0, -UPPER_ARM, 0);
    make(`${prefix}Wrist`, elbow, 0, -FOREARM, 0);
  }

  root.updateMatrixWorld(true);
  const list = BONE_NAMES.map((name) => bones[name]);
  const skeleton = new THREE.Skeleton(list);
  const index = Object.fromEntries(BONE_NAMES.map((name, i) => [name, i])) as Record<BoneName, number>;
  return { root, bones, skeleton, index };
}

export function buildCharacter(): BuiltCharacter {
  const { root, bones, skeleton, index } = createSkeleton();

  const limbGeometries: THREE.BufferGeometry[] = [];
  const shortsGeometries: THREE.BufferGeometry[] = [];

  for (const side of ['left', 'right'] as const) {
    const hip = bones[`${side}Hip`];
    const leg = lathe(LEG_PROFILE, 24);
    bulgeBack(leg, -0.35, 0.06, 0.016);
    applySkin(leg, (_x, y) => [index[`${side}Hip`], index[`${side}Knee`], smoothstep(-THIGH + 0.045, -THIGH - 0.045, y)]);
    leg.applyMatrix4(hip.matrixWorld);
    limbGeometries.push(leg);

    const shoulder = bones[`${side}Shoulder`];
    const arm = lathe(ARM_PROFILE, 20);
    bulgeBack(arm, -0.13, 0.06, 0.006);
    applySkin(arm, (_x, y) => [
      index[`${side}Shoulder`],
      index[`${side}Elbow`],
      smoothstep(-UPPER_ARM + 0.04, -UPPER_ARM - 0.04, y),
    ]);
    arm.applyMatrix4(shoulder.matrixWorld);
    limbGeometries.push(arm);

    const shortsLeg = lathe(SHORTS_LEG_PROFILE, 24);
    applySkin(shortsLeg, () => [index[`${side}Hip`], 0, 0]);
    shortsLeg.applyMatrix4(hip.matrixWorld);
    shortsGeometries.push(shortsLeg);
  }

  const pelvis = lathe(PELVIS_PROFILE, 32);
  pelvis.scale(1, 1, TORSO_DEPTH);
  applySkin(pelvis, (_x, y) => [index.body, index.torso, smoothstep(0.64, 0.76, y)]);
  shortsGeometries.push(pelvis);

  const shirt = lathe(TORSO_PROFILE, 40);
  shirt.scale(1, 1, TORSO_DEPTH);
  const bottom = TORSO_PROFILE[0][1];
  const top = TORSO_PROFILE[TORSO_PROFILE.length - 1][1];
  const uv = shirt.attributes.uv;
  const shirtPos = shirt.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, (shirtPos.getY(i) - bottom) / (top - bottom));
  applySkin(shirt, (_x, y) => [index.torso, index.chest, smoothstep(0.84, 0.97, y)]);

  const limbs = mergeGeometries(limbGeometries)!;
  const shorts = mergeGeometries(shortsGeometries)!;
  [...limbGeometries, ...shortsGeometries].forEach((g) => g.dispose());

  const stripes = createStripeTexture(PALETTE.shirtBlue, PALETTE.shirtYellow, 3);
  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: PALETTE.skin, roughness: 0.66 }),
    shirt: new THREE.MeshPhysicalMaterial({
      map: stripes,
      side: THREE.DoubleSide,
      roughness: 0.85,
      sheen: 0.5,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color('#ffffff'),
    }),
    shorts: new THREE.MeshPhysicalMaterial({
      color: PALETTE.shorts,
      side: THREE.DoubleSide,
      roughness: 0.85,
      sheen: 0.4,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color('#8a8fb8'),
    }),
  };

  const group = new THREE.Group();
  group.add(root);
  const identity = new THREE.Matrix4();
  for (const [geometry, material] of [
    [limbs, materials.skin],
    [shirt, materials.shirt],
    [shorts, materials.shorts],
  ] as const) {
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.bind(skeleton, identity);
    group.add(mesh);
  }

  return {
    group,
    bones,
    dispose() {
      limbs.dispose();
      shorts.dispose();
      shirt.dispose();
      stripes.dispose();
      Object.values(materials).forEach((m) => m.dispose());
      skeleton.dispose();
    },
  };
}
