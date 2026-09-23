'use client';

import { useLayoutEffect, useMemo, type MutableRefObject } from 'react';
import { createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { Head } from './character/Head';
import { Backpack, Collar, Hand, Sleeve, Sneaker } from './character/Parts';
import { buildCharacter } from './character/rig';
import { HIP_Y, PALETTE, SHIN, SHOULDER_SPLAY, THIGH, TORSO_DEPTH, TORSO_PROFILE, TORSO_Y } from './character/spec';

// Sneaker sole outline in ankle-bone space as [y, z] (heel -> toe); used to keep the lowest point on the ground.
const SOLE: [number, number][] = [
  [-0.099, -0.116],
  [-0.116, -0.11],
  [-0.119, -0.107],
  [-0.12, -0.104],
  [-0.12, 0.104],
  [-0.119, 0.137],
  [-0.116, 0.167],
  [-0.112, 0.194],
  [-0.107, 0.222],
  [-0.101, 0.247],
  [-0.099, 0.25],
  [-0.096, 0.253],
  [-0.077, 0.259],
];

export interface CharacterRig {
  body: THREE.Object3D | null;
  torso: THREE.Object3D | null;
  chest: THREE.Object3D | null;
  head: THREE.Object3D | null;
  leftShoulder: THREE.Object3D | null;
  leftElbow: THREE.Object3D | null;
  rightShoulder: THREE.Object3D | null;
  rightElbow: THREE.Object3D | null;
  leftHip: THREE.Object3D | null;
  leftKnee: THREE.Object3D | null;
  leftAnkle: THREE.Object3D | null;
  rightHip: THREE.Object3D | null;
  rightKnee: THREE.Object3D | null;
  rightAnkle: THREE.Object3D | null;
}

export function createRig(): CharacterRig {
  return {
    body: null,
    torso: null,
    chest: null,
    head: null,
    leftShoulder: null,
    leftElbow: null,
    rightShoulder: null,
    rightElbow: null,
    leftHip: null,
    leftKnee: null,
    leftAnkle: null,
    rightHip: null,
    rightKnee: null,
    rightAnkle: null,
  };
}

function JointFill({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 16, 12]} />
      <meshStandardMaterial color={PALETTE.skin} roughness={0.66} />
    </mesh>
  );
}

function ShirtHem() {
  const hemY = TORSO_PROFILE[1][1] + 0.006 - TORSO_Y;
  return (
    <mesh position-y={hemY} rotation-x={Math.PI / 2} scale={[1, TORSO_DEPTH, 1]}>
      <torusGeometry args={[TORSO_PROFILE[1][0] + 0.003, 0.012, 8, 48]} />
      <meshStandardMaterial color={PALETTE.shirtBlue} roughness={0.85} />
    </mesh>
  );
}

export function Character({ rig }: { rig: MutableRefObject<CharacterRig> }) {
  const built = useMemo(() => buildCharacter(), []);
  const b = built.bones;

  useLayoutEffect(() => {
    rig.current = {
      body: b.body,
      torso: b.torso,
      chest: b.chest,
      head: b.head,
      leftShoulder: b.leftShoulder,
      leftElbow: b.leftElbow,
      rightShoulder: b.rightShoulder,
      rightElbow: b.rightElbow,
      leftHip: b.leftHip,
      leftKnee: b.leftKnee,
      leftAnkle: b.leftAnkle,
      rightHip: b.rightHip,
      rightKnee: b.rightKnee,
      rightAnkle: b.rightAnkle,
    };
    return () => {
      rig.current = createRig();
      built.dispose();
    };
  }, [built, b, rig]);

  return (
    <>
      <primitive object={built.group} />
      {createPortal(<Head />, b.head)}
      {createPortal(
        <>
          <Collar />
          <Backpack />
        </>,
        b.chest,
      )}
      {createPortal(<ShirtHem />, b.torso)}
      {createPortal(<Sleeve side={-1} />, b.leftShoulder)}
      {createPortal(<Sleeve side={1} />, b.rightShoulder)}
      {createPortal(<JointFill radius={0.05} />, b.leftElbow)}
      {createPortal(<JointFill radius={0.05} />, b.rightElbow)}
      {createPortal(<Hand side={-1} />, b.leftWrist)}
      {createPortal(<Hand side={1} />, b.rightWrist)}
      {createPortal(<JointFill radius={0.064} />, b.leftKnee)}
      {createPortal(<JointFill radius={0.064} />, b.rightKnee)}
      {createPortal(<Sneaker side={-1} />, b.leftAnkle)}
      {createPortal(<Sneaker side={1} />, b.rightAnkle)}
    </>
  );
}

export interface PoseInput {
  dt: number;
  time: number;
  phase: number;
  speed: number;
  runSpeed: number;
  moving: boolean;
  grounded: boolean;
  rising: boolean;
  flipping: boolean;
  shooting: boolean;
}

function approach(obj: THREE.Object3D | null, axis: 'x' | 'y' | 'z', target: number, rate: number, dt: number) {
  if (!obj) return;
  obj.rotation[axis] += (target - obj.rotation[axis]) * (1 - Math.exp(-rate * dt));
}

function approachY(obj: THREE.Object3D | null, offset: number, rate: number, dt: number) {
  if (!obj) return;
  const rest = (obj.userData.restY as number | undefined) ?? 0;
  obj.position.y += (rest + offset - obj.position.y) * (1 - Math.exp(-rate * dt));
}

export function animateCharacter(r: CharacterRig, p: PoseInput) {
  const sprint = p.moving ? Math.min(1, Math.max(0, (p.speed - 5) / (p.runSpeed - 5))) : 0;

  let lean = 0;
  let twist = 0;
  let headPitch = 0;
  let bodyY = 0;
  let breathe = Math.sin(p.time * 2.2) * 0.012;
  let lHip = 0;
  let rHip = 0;
  let lKnee = 0.05;
  let rKnee = 0.05;
  let lShoulder = Math.sin(p.time * 1.6) * 0.05;
  let rShoulder = -lShoulder;
  let lElbow = -0.15;
  let rElbow = -0.15;
  let lRaise = 0;
  let rRaise = 0;

  if (p.flipping) {
    lean = 0.38;
    lHip = rHip = -1.2;
    lKnee = rKnee = 2.2;
    lShoulder = rShoulder = -0.7;
    lElbow = rElbow = -1.7;
    headPitch = 0.3;
    breathe = 0;
  } else if (!p.grounded) {
    lean = p.rising ? 0.1 : 0.02;
    lHip = -0.9;
    lKnee = 1.3;
    rHip = 0.25;
    rKnee = 0.5;
    lShoulder = -2.3;
    rShoulder = 0.5;
    breathe = 0;
    lElbow = -0.25;
    rElbow = -0.9;
  } else if (p.moving) {
    const ampHip = 0.5 + 0.4 * sprint;
    const ampKnee = 0.9 + 0.9 * sprint;
    const ampArm = 0.55 + 0.45 * sprint;
    const legL = p.phase;
    const legR = p.phase + Math.PI;

    lHip = Math.sin(legL) * ampHip - 0.1 * sprint;
    rHip = Math.sin(legR) * ampHip - 0.1 * sprint;
    lKnee = 0.12 + Math.max(0, -Math.cos(legL - 0.3)) * ampKnee;
    rKnee = 0.12 + Math.max(0, -Math.cos(legR - 0.3)) * ampKnee;

    const reachForward = ampArm + 1.5 * sprint;
    const reachBack = ampArm * 0.9 + 0.35 * sprint;
    const swing = (leg: number) => {
      const s = -Math.sin(leg);
      return s < 0 ? s * reachForward : s * reachBack;
    };
    lShoulder = swing(legL);
    rShoulder = swing(legR);
    lRaise = Math.max(0, -lShoulder) / reachForward;
    rRaise = Math.max(0, -rShoulder) / reachForward;
    const baseElbow = -0.35 - 1.1 * sprint;
    lElbow = baseElbow * (1 - 0.75 * lRaise * sprint);
    rElbow = baseElbow * (1 - 0.75 * rRaise * sprint);

    lean = 0.07 + 0.3 * sprint;
    twist = Math.sin(p.phase) * (0.08 + 0.1 * sprint);
    headPitch = -lean * 0.65;
    bodyY = Math.abs(Math.cos(p.phase)) * (0.05 + 0.05 * sprint) - 0.03 - 0.025 * sprint;
    breathe = 0;
  }

  if (p.shooting) {
    rShoulder = -1.55;
    rElbow = -0.1;
  }

  const k = 18;
  const armRate = p.moving && p.grounded ? 26 : k;
  approach(r.torso, 'x', lean * 0.45, 10, p.dt);
  approach(r.chest, 'x', lean * 0.55, 10, p.dt);
  approach(r.torso, 'y', twist * 0.35, 12, p.dt);
  approach(r.chest, 'y', twist * 0.65, 12, p.dt);
  approach(r.head, 'x', headPitch, 8, p.dt);
  approach(r.head, 'y', -twist * 0.7, 10, p.dt);
  approach(r.leftHip, 'x', lHip, k, p.dt);
  approach(r.rightHip, 'x', rHip, k, p.dt);
  approach(r.leftKnee, 'x', lKnee, k + 4, p.dt);
  approach(r.rightKnee, 'x', rKnee, k + 4, p.dt);
  approach(r.leftShoulder, 'x', lShoulder, armRate, p.dt);
  approach(r.rightShoulder, 'x', rShoulder, p.shooting ? 30 : armRate, p.dt);
  // Abduct a raised arm so it clears the big head instead of passing through it.
  approach(r.leftShoulder, 'z', -(SHOULDER_SPLAY + 0.22 * Math.min(1, Math.max(0, -lShoulder / 2.3))), armRate, p.dt);
  approach(r.rightShoulder, 'z', SHOULDER_SPLAY + 0.22 * Math.min(1, Math.max(0, -rShoulder / 2.3)), armRate, p.dt);
  approach(r.leftElbow, 'x', lElbow, k, p.dt);
  approach(r.rightElbow, 'x', rElbow, p.shooting ? 30 : k, p.dt);
  if (r.body) r.body.position.y += (bodyY - r.body.position.y) * (1 - Math.exp(-20 * p.dt));
  approachY(r.torso, breathe, 20, p.dt);
  approachY(r.leftShoulder, lRaise * 0.06 * sprint, 14, p.dt);
  approachY(r.rightShoulder, rRaise * 0.06 * sprint, 14, p.dt);

  const legs = [
    [r.leftHip, r.leftKnee, r.leftAnkle],
    [r.rightHip, r.rightKnee, r.rightAnkle],
  ] as const;
  const ankleRate = 1 - Math.exp(-60 * p.dt);
  for (const [hip, knee, ankle] of legs) {
    if (!hip || !knee || !ankle) continue;
    const target = p.flipping ? 0 : -Math.min(0.45, 0.5 * Math.max(0, hip.rotation.x + knee.rotation.x));
    ankle.rotation.x += (target - ankle.rotation.x) * ankleRate;
  }

  // Lift the body only when the lagged leg pose would push a sole below the ground.
  if (p.grounded && !p.flipping && r.body) {
    let need = -Infinity;
    for (const [hip, knee, ankle] of legs) {
      if (!hip || !knee || !ankle) continue;
      const thigh = hip.rotation.x;
      const shin = thigh + knee.rotation.x;
      const foot = shin + ankle.rotation.x;
      const ankleY = HIP_Y - THIGH * Math.cos(thigh) - SHIN * Math.cos(shin);
      for (const [y, z] of SOLE) need = Math.max(need, -(ankleY + y * Math.cos(foot) - z * Math.sin(foot)));
    }
    if (r.body.position.y < need) r.body.position.y = need;
  }
}
