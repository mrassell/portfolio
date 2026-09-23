'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { InputState } from './input';
import type { ParticleApi } from './particles';
import {
  BOSS_MAX_HP,
  PLAYER_MAX_HP,
  damp,
  lerpAngle,
  type Collider,
  type FightEvent,
  type FightStatus,
  type PlayerState,
  type WorldFx,
} from './shared';

const DESCENT_HEIGHT = 48;
const DESCENT_TIME = 2.4;
const FIREBALL_SPEED = 30;
const FIRE_COOLDOWN = 0.1;
const MAX_FIREBALLS = 40;
const WAVE_SPEED = 12;
const WAVE_HEIGHT = 0.8;
const WAVE_MAX_RADIUS = 38;
const MAX_WAVES = 4;
const MAX_ORBS = 8;
const ORB_FLIGHT = 1.3;
const ORB_BLAST_RADIUS = 2;
const HIT_RADIUS = 2.2;
const LANDING_RADIUS = 3.6;
const SOLID_BOSS: Collider[] = [{ x: 0, z: 0, r: 2.4, h: 99 }];
const NO_COLLIDERS: Collider[] = [];

type BossState =
  | 'off'
  | 'descending'
  | 'roar'
  | 'idle'
  | 'windup'
  | 'slam'
  | 'volley'
  | 'recover'
  | 'dying'
  | 'dead'
  | 'gloat';

interface Fireball {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
}

interface Wave {
  active: boolean;
  radius: number;
}

interface Orb {
  active: boolean;
  start: THREE.Vector3;
  target: THREE.Vector3;
  t: number;
}

interface BossRig {
  root: THREE.Group | null;
  body: THREE.Group | null;
  head: THREE.Group | null;
  leftArm: THREE.Group | null;
  rightArm: THREE.Group | null;
  rightFist: THREE.Object3D | null;
}

function useBossMaterials() {
  const materials = useMemo(
    () => ({
      red: new THREE.MeshStandardMaterial({ color: '#c1121f', roughness: 0.4, metalness: 0.35 }),
      steel: new THREE.MeshStandardMaterial({ color: '#aab4bf', roughness: 0.3, metalness: 0.75 }),
      navy: new THREE.MeshStandardMaterial({ color: '#1d3557', roughness: 0.45, metalness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: '#e9b949', roughness: 0.25, metalness: 0.85 }),
      dark: new THREE.MeshStandardMaterial({ color: '#23252f', roughness: 0.5, metalness: 0.5 }),
      core: new THREE.MeshBasicMaterial({ color: '#5ef2ff', toneMapped: false }),
      eyes: new THREE.MeshBasicMaterial({ color: '#ffe066', toneMapped: false }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );
  return materials;
}

type BossMaterials = ReturnType<typeof useBossMaterials>;

function Box({
  args,
  position,
  rotation,
  material,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  material: THREE.Material;
}) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  );
}

function BossModel({ rig, m }: { rig: MutableRefObject<BossRig>; m: BossMaterials }) {
  const leg = (side: 1 | -1) => (
    <group position={[0.85 * side, 3.0, 0]}>
      <Box args={[1.0, 1.4, 1.1]} position={[0, -0.7, 0]} material={m.steel} />
      <Box args={[0.8, 0.5, 0.4]} position={[0, -1.4, 0.55]} material={m.gold} />
      <Box args={[1.1, 1.3, 1.2]} position={[0, -2.0, 0]} material={m.red} />
      <Box args={[1.3, 0.45, 1.9]} position={[0, -2.78, 0.25]} material={m.navy} />
    </group>
  );

  const arm = (side: 1 | -1) => (
    <group
      ref={(g) => {
        rig.current[side === -1 ? 'leftArm' : 'rightArm'] = g;
      }}
      position={[2.3 * side, 2.1, 0]}
    >
      <Box args={[0.8, 1.5, 0.9]} position={[0, -0.9, 0]} material={m.steel} />
      <mesh position={[0, -1.7, 0]} material={m.gold} castShadow>
        <sphereGeometry args={[0.45, 16, 12]} />
      </mesh>
      <Box args={[0.95, 1.3, 1.0]} position={[0, -2.4, 0]} material={m.red} />
      <group
        position={[0, -3.4, 0]}
        ref={(g) => {
          if (side === 1) rig.current.rightFist = g;
        }}
      >
        <Box args={[1.15, 1.0, 1.15]} position={[0, 0, 0]} material={m.navy} />
      </group>
    </group>
  );

  return (
    <group
      ref={(g) => {
        rig.current.root = g;
      }}
    >
      {leg(-1)}
      {leg(1)}
      <Box args={[2.6, 0.7, 1.5]} position={[0, 3.25, 0]} material={m.dark} />
      <Box args={[0.7, 0.5, 0.15]} position={[0, 3.25, 0.78]} material={m.gold} />

      <group
        ref={(g) => {
          rig.current.body = g;
        }}
        position-y={3.6}
      >
        <Box args={[2.4, 0.9, 1.5]} position={[0, 0.1, 0]} material={m.steel} />
        <Box args={[3.4, 2.4, 1.9]} position={[0, 1.3, 0]} material={m.red} />
        <Box args={[2.6, 1.2, 0.3]} position={[0, 1.6, 0.95]} material={m.navy} />
        <mesh position={[0, 1.55, 1.12]} rotation-x={Math.PI / 2} material={m.core}>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 24]} />
        </mesh>
        {[-0.9, 0.9].map((x) => (
          <Box key={x} args={[0.5, 0.18, 0.12]} position={[x, 0.75, 0.98]} material={m.gold} />
        ))}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box args={[1.4, 1.1, 1.6]} position={[2.25 * side, 2.2, 0]} material={m.navy} />
            <Box args={[1.45, 0.2, 1.65]} position={[2.25 * side, 2.82, 0]} material={m.gold} />
          </group>
        ))}

        <group
          ref={(g) => {
            rig.current.head = g;
          }}
          position-y={2.75}
        >
          <Box args={[1.3, 1.1, 1.25]} position={[0, 0.55, 0]} material={m.steel} />
          <Box args={[1.0, 0.45, 0.1]} position={[0, 0.52, 0.63]} material={m.dark} />
          <mesh position={[0, 0.58, 0.69]} material={m.eyes}>
            <boxGeometry args={[0.8, 0.14, 0.05]} />
          </mesh>
          <Box args={[0.7, 0.3, 0.1]} position={[0, 0.2, 0.63]} material={m.red} />
          <Box args={[0.25, 0.32, 0.25]} position={[0, 1.2, 0.5]} material={m.red} />
          {[-1, 1].map((side) => (
            <Box
              key={side}
              args={[0.13, 0.95, 0.13]}
              position={[0.32 * side, 1.4, 0.45]}
              rotation={[0, 0, -0.6 * side]}
              material={m.gold}
            />
          ))}
        </group>

        {arm(-1)}
        {arm(1)}
      </group>
    </group>
  );
}

export interface BossFightProps {
  run: number;
  input: MutableRefObject<InputState>;
  player: MutableRefObject<PlayerState>;
  fx: MutableRefObject<WorldFx>;
  dynamicColliders: MutableRefObject<Collider[]>;
  clouds: MutableRefObject<ParticleApi | null>;
  fire: MutableRefObject<ParticleApi | null>;
  onEvent: (event: FightEvent) => void;
}

export function BossFight({ run, input, player, fx, dynamicColliders, clouds, fire, onEvent }: BossFightProps) {
  const rig = useRef<BossRig>({ root: null, body: null, head: null, leftArm: null, rightArm: null, rightFist: null });
  const materials = useBossMaterials();
  const group = useRef<THREE.Group>(null!);
  const landingMarker = useRef<THREE.Mesh>(null!);
  const fireballCores = useRef<THREE.InstancedMesh>(null!);
  const fireballHalos = useRef<THREE.InstancedMesh>(null!);
  const waveMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const orbMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const markerMeshes = useRef<(THREE.Mesh | null)[]>([]);

  const sim = useMemo(
    () => ({
      state: 'off' as BossState,
      t: 0,
      y: DESCENT_HEIGHT,
      hp: BOSS_MAX_HP,
      reportedHp: -1,
      flash: 0,
      nextAttack: 0,
      fired: false,
      secondWave: -1,
      cooldown: 0,
      boomTimer: 0,
      fireballs: Array.from({ length: MAX_FIREBALLS }, (): Fireball => ({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
      })),
      waves: Array.from({ length: MAX_WAVES }, (): Wave => ({ active: false, radius: 0 })),
      orbs: Array.from({ length: MAX_ORBS }, (): Orb => ({
        active: false,
        start: new THREE.Vector3(),
        target: new THREE.Vector3(),
        t: 0,
      })),
    }),
    [],
  );
  const scratch = useMemo(
    () => ({
      v: new THREE.Vector3(),
      w: new THREE.Vector3(),
      matrix: new THREE.Matrix4(),
      zero: new THREE.Matrix4().makeScale(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
    }),
    [],
  );

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    sim.fireballs.forEach((f) => (f.active = false));
    sim.waves.forEach((w) => (w.active = false));
    sim.orbs.forEach((o) => (o.active = false));
    sim.t = 0;
    sim.flash = 0;
    sim.secondWave = -1;
    sim.nextAttack = 0;
    input.current.fireRequests = 0;

    if (run === 0) {
      sim.state = 'off';
      fx.current.zoomBoost = 1;
      dynamicColliders.current = NO_COLLIDERS;
      return;
    }

    sim.state = 'descending';
    sim.y = DESCENT_HEIGHT;
    sim.hp = BOSS_MAX_HP;
    sim.reportedHp = BOSS_MAX_HP;
    player.current.hp = PLAYER_MAX_HP;
    player.current.invuln = 0;
    fx.current.zoomBoost = 1.45;
    onEventRef.current({ type: 'bossHp', hp: BOSS_MAX_HP });
    onEventRef.current({ type: 'playerHp', hp: PLAYER_MAX_HP });
    onEventRef.current({ type: 'status', status: 'incoming' });
  }, [run, sim, input, player, fx, dynamicColliders]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = player.current;
    const r = rig.current;
    const time = clock.elapsedTime;

    const setStatus = (status: FightStatus) => onEventRef.current({ type: 'status', status });
    const enter = (state: BossState) => {
      sim.state = state;
      sim.t = 0;
      sim.fired = false;
    };

    const hurtPlayer = (fromX: number, fromZ: number) => {
      if (p.invuln > 0 || p.hp <= 0 || sim.state === 'dying' || sim.state === 'dead') return;
      p.hp -= 1;
      p.invuln = 1.3;
      fx.current.shake = Math.max(fx.current.shake, 0.55);
      scratch.v.set(p.pos.x - fromX, 0, p.pos.z - fromZ);
      if (scratch.v.lengthSq() < 1e-4) scratch.v.set(0, 0, 1);
      scratch.v.normalize();
      p.vel.addScaledVector(scratch.v, 10);
      if (p.grounded) {
        p.grounded = false;
        p.vy = 6;
        p.jumps = 2;
      }
      onEventRef.current({ type: 'playerHp', hp: p.hp });
      if (p.hp <= 0) {
        enter('gloat');
        sim.waves.forEach((w) => (w.active = false));
        sim.orbs.forEach((o) => (o.active = false));
        setStatus('lost');
      }
    };

    const spawnWave = () => {
      const wave = sim.waves.find((w) => !w.active);
      if (!wave) return;
      wave.active = true;
      wave.radius = 2.4;
      fx.current.shake = Math.max(fx.current.shake, 0.8);
      clouds.current?.burst(0, 0.3, 0, { count: 26, ring: true, speed: 9, size: 0.8, life: 0.8, rise: 0.2, color: '#e7e0d6' });
    };

    const fireOrbs = (count: number) => {
      const fist = r.rightFist;
      if (fist) fist.getWorldPosition(scratch.w);
      else scratch.w.set(0, 8, 0);
      for (let i = 0; i < count; i++) {
        const orb = sim.orbs.find((o) => !o.active);
        if (!orb) break;
        orb.active = true;
        orb.t = 0;
        orb.start.copy(scratch.w);
        const spread = i === 0 ? 0 : 3 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        let tx = p.pos.x + p.vel.x * 0.35 + Math.cos(angle) * spread;
        let tz = p.pos.z + p.vel.z * 0.35 + Math.sin(angle) * spread;
        const d = Math.hypot(tx, tz);
        if (d > 33) {
          tx *= 33 / d;
          tz *= 33 / d;
        }
        if (d < 3) {
          const k = 3 / Math.max(d, 0.01);
          tx *= k;
          tz *= k;
        }
        orb.target.set(tx, 0, tz);
      }
      fire.current?.burst(scratch.w.x, scratch.w.y, scratch.w.z, { count: 10, speed: 3, size: 0.4, life: 0.35, color: '#ff2e63' });
    };

    const phase2 = sim.hp <= BOSS_MAX_HP / 2;
    const alive = sim.state !== 'off' && sim.state !== 'dead' && sim.state !== 'dying';
    const targetable = alive && sim.state !== 'descending' && sim.state !== 'gloat';

    sim.t += dt;
    group.current.visible = sim.state !== 'off' && sim.state !== 'dead';
    dynamicColliders.current = alive && sim.state !== 'descending' ? SOLID_BOSS : NO_COLLIDERS;

    if (group.current.visible && r.root) {
      const facing = Math.atan2(p.pos.x, p.pos.z);
      r.root.rotation.y = lerpAngle(r.root.rotation.y, facing, 1 - Math.exp(-(sim.state === 'dying' ? 0 : 3) * dt));
    }

    let armX = Math.sin(time * 1.4) * 0.12;
    let armSpread = 0.12;
    let rightArmX = armX;
    let lean = 0;
    let headTilt = 0;

    switch (sim.state) {
      case 'descending': {
        const k = Math.min(1, sim.t / DESCENT_TIME);
        sim.y = DESCENT_HEIGHT * (1 - k * k);
        armSpread = 0.5;
        clouds.current?.emit(
          (Math.random() - 0.5) * 2,
          sim.y + 0.2,
          (Math.random() - 0.5) * 2,
          0,
          3,
          0,
          0.9,
          0.6,
          '#d6d3d1',
        );
        fire.current?.emit((Math.random() - 0.5) * 1.6, sim.y, (Math.random() - 0.5) * 1.6, 0, -4, 0, 0.5, 0.25, '#ff9f1c');
        if (k >= 1) {
          sim.y = 0;
          fx.current.shake = 1.4;
          clouds.current?.burst(0, 0.4, 0, { count: 40, ring: true, speed: 12, size: 1.1, life: 1, rise: 0.4, color: '#e7e0d6' });
          const d = Math.hypot(p.pos.x, p.pos.z);
          if (d < LANDING_RADIUS + 1) {
            scratch.v.set(p.pos.x, 0, p.pos.z);
            if (d < 0.01) scratch.v.set(0, 0, 1);
            scratch.v.normalize();
            p.pos.set(scratch.v.x * (LANDING_RADIUS + 1.5), 0, scratch.v.z * (LANDING_RADIUS + 1.5));
            hurtPlayer(0, 0);
          }
          enter('roar');
        }
        break;
      }
      case 'roar':
        lean = -0.25;
        headTilt = -0.45;
        armSpread = 1.3;
        armX = -0.4;
        rightArmX = -0.4;
        fx.current.shake = Math.max(fx.current.shake, 0.25);
        if (sim.t > 1.8) {
          enter('idle');
          setStatus('fighting');
        }
        break;
      case 'idle':
        if (sim.t > (phase2 ? 0.9 : 1.6)) {
          sim.nextAttack++;
          enter(sim.nextAttack % 2 === 1 ? 'windup' : 'volley');
        }
        break;
      case 'windup':
        armX = -2.9;
        rightArmX = -2.9;
        armSpread = 0.3;
        lean = -0.15;
        sim.y = damp(sim.y, 1.4, 6, dt);
        if (sim.t > (phase2 ? 0.6 : 0.8)) {
          enter('slam');
          sim.y = 0;
          spawnWave();
          sim.secondWave = phase2 ? 0.6 : -1;
        }
        break;
      case 'slam':
        armX = -0.6;
        rightArmX = -0.6;
        lean = 0.3;
        sim.y = damp(sim.y, 0, 20, dt);
        if (sim.t > 0.9) enter('recover');
        break;
      case 'volley':
        rightArmX = -2.4;
        headTilt = -0.2;
        if (!sim.fired && sim.t > 0.35) {
          sim.fired = true;
          fireOrbs(phase2 ? 5 : 3);
        }
        if (sim.t > 1.5) enter('recover');
        break;
      case 'recover':
        sim.y = damp(sim.y, 0, 8, dt);
        if (sim.t > (phase2 ? 0.5 : 0.9)) enter('idle');
        break;
      case 'dying': {
        lean = Math.sin(sim.t * 30) * 0.05 + sim.t * 0.08;
        headTilt = 0.4;
        armX = 0.3;
        rightArmX = 0.5;
        sim.y = -sim.t * 0.5;
        fx.current.shake = Math.max(fx.current.shake, 0.35);
        sim.boomTimer -= dt;
        if (sim.boomTimer <= 0) {
          sim.boomTimer = 0.13;
          const bx = (Math.random() - 0.5) * 4;
          const by = 1 + Math.random() * 6 + sim.y;
          const bz = (Math.random() - 0.5) * 3;
          fire.current?.burst(bx, by, bz, { count: 12, speed: 5, size: 0.55, life: 0.45, color: Math.random() > 0.5 ? '#ff9f1c' : '#ff5e1a' });
          clouds.current?.burst(bx, by, bz, { count: 6, speed: 2, size: 0.7, life: 0.8, color: '#57534e' });
        }
        if (sim.t > 3) {
          fire.current?.burst(0, 3, 0, { count: 50, speed: 14, size: 1, life: 0.7, color: '#ffb703' });
          clouds.current?.burst(0, 2, 0, { count: 45, speed: 11, size: 1.4, life: 1.3, color: '#f5f5f4' });
          fx.current.shake = 1.6;
          fx.current.zoomBoost = 1;
          enter('dead');
          setStatus('won');
        }
        break;
      }
      case 'gloat':
        lean = -0.2;
        armSpread = 0.9;
        armX = -1.2 + Math.sin(time * 6) * 0.2;
        rightArmX = armX;
        break;
    }

    if (sim.secondWave >= 0) {
      sim.secondWave -= dt;
      if (sim.secondWave < 0 && alive && sim.state !== 'gloat') spawnWave();
    }

    if (r.root) r.root.position.y = sim.y;
    if (r.body) r.body.rotation.x = damp(r.body.rotation.x, lean, 10, dt);
    if (r.head) r.head.rotation.x = damp(r.head.rotation.x, headTilt, 8, dt);
    if (r.leftArm) {
      r.leftArm.rotation.x = damp(r.leftArm.rotation.x, armX, 12, dt);
      r.leftArm.rotation.z = damp(r.leftArm.rotation.z, -armSpread, 10, dt);
    }
    if (r.rightArm) {
      r.rightArm.rotation.x = damp(r.rightArm.rotation.x, rightArmX, 12, dt);
      r.rightArm.rotation.z = damp(r.rightArm.rotation.z, armSpread, 10, dt);
    }

    sim.flash = Math.max(0, sim.flash - dt * 9);
    const pulse = sim.state === 'windup' ? 0.35 + Math.sin(time * 30) * 0.15 : 0;
    const glow = Math.max(sim.flash, pulse);
    for (const mat of [materials.red, materials.steel, materials.navy, materials.gold, materials.dark]) {
      mat.emissive.setRGB(glow, glow * (sim.flash > pulse ? 1 : 0.2), glow * (sim.flash > pulse ? 1 : 0.1));
    }
    materials.core.color.setHSL(phase2 ? 0.98 : 0.52, 1, 0.55 + Math.sin(time * 8) * 0.1);
    materials.eyes.color.set(phase2 ? '#ff3b3b' : '#ffe066');

    landingMarker.current.visible = sim.state === 'descending';
    if (landingMarker.current.visible) {
      const s = 1 + Math.sin(time * 12) * 0.05;
      landingMarker.current.scale.set(s, s, s);
    }

    if (targetable) {
      sim.cooldown -= dt;
      if (input.current.fireRequests > 0 && sim.cooldown <= 0 && p.hp > 0) {
        input.current.fireRequests--;
        sim.cooldown = FIRE_COOLDOWN;
        const ball = sim.fireballs.find((f) => !f.active);
        if (ball) {
          scratch.w.set(p.pos.x, p.ground + p.y + 1.05, p.pos.z);
          scratch.v.set((Math.random() - 0.5) * 0.8, sim.y + 4.6 + (Math.random() - 0.5), (Math.random() - 0.5) * 0.8).sub(scratch.w).normalize();
          ball.active = true;
          ball.life = 1.6;
          ball.pos.copy(scratch.w).addScaledVector(scratch.v, 0.55);
          ball.vel.copy(scratch.v).multiplyScalar(FIREBALL_SPEED);
          p.heading = Math.atan2(scratch.v.x, scratch.v.z);
          p.shootTimer = 0.2;
          fire.current?.burst(ball.pos.x, ball.pos.y, ball.pos.z, { count: 4, speed: 1.5, size: 0.22, life: 0.18, color: '#ffd166' });
        }
      }
    } else {
      input.current.fireRequests = 0;
    }

    for (let i = 0; i < MAX_FIREBALLS; i++) {
      const f = sim.fireballs[i];
      if (f.active) {
        f.life -= dt;
        f.pos.addScaledVector(f.vel, dt);
        fire.current?.emit(
          f.pos.x + (Math.random() - 0.5) * 0.2,
          f.pos.y + (Math.random() - 0.5) * 0.2,
          f.pos.z + (Math.random() - 0.5) * 0.2,
          0,
          0.6,
          0,
          0.2 + Math.random() * 0.12,
          0.22,
          Math.random() > 0.5 ? '#ffb347' : '#ff5e1a',
        );
        const horizontal = Math.hypot(f.pos.x, f.pos.z);
        const hitBoss =
          alive &&
          sim.state !== 'descending' &&
          horizontal < HIT_RADIUS &&
          f.pos.y > sim.y + 0.3 &&
          f.pos.y < sim.y + 8;
        if (hitBoss) {
          f.active = false;
          fire.current?.burst(f.pos.x, f.pos.y, f.pos.z, { count: 9, speed: 5, size: 0.35, life: 0.3, color: '#ffd166' });
          if (sim.state !== 'gloat') {
            sim.hp = Math.max(0, sim.hp - 1);
            sim.flash = 0.45;
            fx.current.shake = Math.max(fx.current.shake, 0.08);
            if (sim.hp !== sim.reportedHp) {
              sim.reportedHp = sim.hp;
              onEventRef.current({ type: 'bossHp', hp: sim.hp });
            }
            if (sim.hp <= 0) {
              enter('dying');
              sim.waves.forEach((w) => (w.active = false));
              sim.orbs.forEach((o) => (o.active = false));
              sim.secondWave = -1;
            }
          }
        } else if (f.life <= 0 || f.pos.y < 0) {
          f.active = false;
          clouds.current?.burst(f.pos.x, Math.max(f.pos.y, 0.1), f.pos.z, { count: 4, speed: 1.5, size: 0.25, life: 0.35, color: '#a8a29e' });
        }
      }
      if (f.active) {
        scratch.scale.setScalar(1);
        scratch.matrix.compose(f.pos, scratch.quaternion, scratch.scale);
        fireballCores.current.setMatrixAt(i, scratch.matrix);
        scratch.scale.setScalar(1 + Math.sin(time * 40 + i) * 0.15);
        scratch.matrix.compose(f.pos, scratch.quaternion, scratch.scale);
        fireballHalos.current.setMatrixAt(i, scratch.matrix);
      } else {
        fireballCores.current.setMatrixAt(i, scratch.zero);
        fireballHalos.current.setMatrixAt(i, scratch.zero);
      }
    }
    fireballCores.current.instanceMatrix.needsUpdate = true;
    fireballHalos.current.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < MAX_WAVES; i++) {
      const w = sim.waves[i];
      const mesh = waveMeshes.current[i];
      if (!mesh) continue;
      if (w.active) {
        w.radius += WAVE_SPEED * dt;
        const d = Math.hypot(p.pos.x, p.pos.z);
        if (Math.abs(d - w.radius) < 0.6 && p.y < WAVE_HEIGHT - 0.1) hurtPlayer(0, 0);
        if (Math.random() < 0.6) {
          const a = Math.random() * Math.PI * 2;
          clouds.current?.emit(Math.cos(a) * w.radius, 0.2, Math.sin(a) * w.radius, 0, 1.2, 0, 0.35, 0.4, '#d6cfc4');
        }
        if (w.radius > WAVE_MAX_RADIUS) w.active = false;
      }
      mesh.visible = w.active;
      if (w.active) {
        mesh.scale.set(w.radius, 1, w.radius);
        (mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - w.radius / WAVE_MAX_RADIUS) + 0.1;
      }
    }

    for (let i = 0; i < MAX_ORBS; i++) {
      const o = sim.orbs[i];
      const orbMesh = orbMeshes.current[i];
      const marker = markerMeshes.current[i];
      if (!orbMesh || !marker) continue;
      if (o.active) {
        o.t += dt / ORB_FLIGHT;
        if (o.t >= 1) {
          o.active = false;
          fire.current?.burst(o.target.x, 0.4, o.target.z, { count: 18, speed: 6, size: 0.55, life: 0.45, color: '#ff2e63' });
          clouds.current?.burst(o.target.x, 0.3, o.target.z, { count: 10, ring: true, speed: 4, size: 0.6, life: 0.7, color: '#a8a29e' });
          fx.current.shake = Math.max(fx.current.shake, 0.3);
          const d = Math.hypot(p.pos.x - o.target.x, p.pos.z - o.target.z);
          if (d < ORB_BLAST_RADIUS && p.y < 1.8) hurtPlayer(o.target.x, o.target.z);
        } else {
          scratch.v.lerpVectors(o.start, o.target, o.t);
          scratch.v.y += Math.sin(Math.PI * o.t) * 9;
          orbMesh.position.copy(scratch.v);
          fire.current?.emit(scratch.v.x, scratch.v.y, scratch.v.z, 0, 0.5, 0, 0.35, 0.25, '#c77dff');
          marker.position.set(o.target.x, 0.06, o.target.z);
          const pulseScale = 0.85 + 0.15 * Math.sin(time * 18) + o.t * 0.15;
          marker.scale.set(pulseScale, pulseScale, pulseScale);
        }
      }
      orbMesh.visible = o.active;
      marker.visible = o.active;
    }
  });

  return (
    <group>
      <group ref={group} visible={false}>
        <BossModel rig={rig} m={materials} />
      </group>

      <mesh ref={landingMarker} rotation-x={-Math.PI / 2} position-y={0.07} visible={false}>
        <ringGeometry args={[LANDING_RADIUS - 0.4, LANDING_RADIUS, 48]} />
        <meshBasicMaterial color="#ff3b3b" transparent opacity={0.8} toneMapped={false} depthWrite={false} />
      </mesh>

      <instancedMesh ref={fireballCores} args={[undefined, undefined, MAX_FIREBALLS]} frustumCulled={false}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshBasicMaterial color="#fff1b8" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={fireballHalos} args={[undefined, undefined, MAX_FIREBALLS]} frustumCulled={false}>
        <sphereGeometry args={[0.48, 12, 10]} />
        <meshBasicMaterial
          color="#ff7b00"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>

      {Array.from({ length: MAX_WAVES }, (_, i) => (
        <mesh
          key={`wave${i}`}
          ref={(m) => {
            waveMeshes.current[i] = m;
          }}
          position-y={WAVE_HEIGHT / 2}
          visible={false}
        >
          <cylinderGeometry args={[1, 1, WAVE_HEIGHT, 72, 1, true]} />
          <meshBasicMaterial
            color="#ff5a36"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {Array.from({ length: MAX_ORBS }, (_, i) => (
        <group key={`orb${i}`}>
          <mesh
            ref={(m) => {
              orbMeshes.current[i] = m;
            }}
            visible={false}
          >
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshBasicMaterial color="#ff2e63" toneMapped={false} />
          </mesh>
          <mesh
            ref={(m) => {
              markerMeshes.current[i] = m;
            }}
            rotation-x={-Math.PI / 2}
            visible={false}
          >
            <ringGeometry args={[ORB_BLAST_RADIUS - 0.3, ORB_BLAST_RADIUS, 40]} />
            <meshBasicMaterial color="#ff2e63" transparent opacity={0.85} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
