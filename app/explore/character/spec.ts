// Shared dimensions for the character. All distances are in meters-ish world units.
// Character root space: feet on y = 0, facing +z, up +y. "side" -1 = the limb at -x, +1 = at +x.

export const PALETTE = {
  skin: '#8a5a3c',
  skinShade: '#744a30',
  skinLight: '#9c6a4a',
  lips: '#6b3526',
  hair: '#141210',
  brow: '#17110d',
  eyeWhite: '#fbfaf7',
  iris: '#4a2c1a',
  pupil: '#0d0a08',
  shirtBlue: '#2f5fb3',
  shirtYellow: '#f4d35e',
  shorts: '#2b2d42',
  shoeRed: '#d62828',
  shoeWhite: '#f5f5f4',
  sock: '#f1efe9',
  pack: '#c2571a',
  packDark: '#9c4212',
} as const;

export const HIP_Y = 0.62;
export const HIP_X = 0.14;
export const THIGH = 0.27;
export const SHIN = 0.23;
export const ANKLE_Y = HIP_Y - THIGH - SHIN;

// Spine: `torso` bone pivots at hip height, `chest` sits above it.
export const TORSO_Y = HIP_Y;
export const CHEST_Y = 0.86;

export const SHOULDER_X = 0.31;
export const SHOULDER_Y = 1.16;
export const SHOULDER_SPLAY = 0.16;
export const UPPER_ARM = 0.26;
export const FOREARM = 0.25;

export const NECK_Y = 1.21;

// Shirt/torso surface of revolution: [radius, worldY]. Cross-section is scaled by TORSO_DEPTH in z.
export const TORSO_PROFILE: [number, number][] = [
  [0.001, 0.7],
  [0.3, 0.7],
  [0.305, 0.74],
  [0.3, 0.82],
  [0.292, 0.92],
  [0.285, 1.0],
  [0.275, 1.06],
  [0.255, 1.11],
  [0.22, 1.15],
  [0.17, 1.18],
  [0.13, 1.2],
];
export const TORSO_DEPTH = 0.86;

export function torsoRadiusAt(worldY: number): number {
  const p = TORSO_PROFILE;
  if (worldY <= p[1][1]) return p[1][0];
  for (let i = 1; i < p.length - 1; i++) {
    const [r0, y0] = p[i];
    const [r1, y1] = p[i + 1];
    if (worldY >= y0 && worldY <= y1) return r0 + ((worldY - y0) / (y1 - y0)) * (r1 - r0);
  }
  return p[p.length - 1][0];
}

// Front (+z) / back (-z) surface of the shirt at a given world height.
export function torsoSurfaceZ(worldY: number): number {
  return torsoRadiusAt(worldY) * TORSO_DEPTH;
}
