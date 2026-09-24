'use client';

import { memo, useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Instance, Instances, RoundedBox, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { BossFight } from './Boss';
import { animateCharacter, Character, createRig } from './Character';
import { SECTIONS, STATION_RADIUS, stationPosition, type Section } from './data';
import type { InputState } from './input';
import { createOccludingMaterial, occlusionUniforms } from './occlusion';
import { Particles, type ParticleApi } from './particles';
import {
  createPlayerState,
  damp,
  lerpAngle,
  type Collider,
  type FightEvent,
  type PlayerState,
  type WorldFx,
} from './shared';
import {
  createBannerTexture,
  createGrassTexture,
  createSignTexture,
  createStoneTexture,
  seededRandom,
} from './textures';

export const WORLD_RADIUS = 34;
const PLAYER_RADIUS = 0.45;
const TRIGGER_RADIUS = 4.2;
const PLAZA_RADIUS = 4.5;
const PLATFORM_RADIUS = 3.2;
const PATH_WIDTH = 2.4;
const WALK_SPEED = 6;
const RUN_SPEED = 11;
const GRAVITY = 30;
const JUMP_VELOCITY = 10;
const DOUBLE_JUMP_VELOCITY = 10.5;
const FLIP_DURATION = 0.55;
const CAMERA_OFFSET = new THREE.Vector3(0, 8, 13);
export const SPAWN: [number, number] = [0, 6];

export const STATIONS = SECTIONS.map((section, i) => {
  const [x, z] = stationPosition(i);
  return { section, x, z, angle: Math.atan2(z, x) };
});

interface FadeTarget {
  x: number;
  z: number;
  halfWidth: number;
  materials: THREE.Material[];
}

export interface Teleport {
  x: number;
  z: number;
}

function angleDelta(a: number, b: number) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

function isClearGround(x: number, z: number, pad: number) {
  const dist = Math.hypot(x, z);
  if (dist < PLAZA_RADIUS + pad) return false;
  for (const s of STATIONS) {
    if (Math.hypot(x - s.x, z - s.z) < PLATFORM_RADIUS + pad) return false;
    const delta = angleDelta(Math.atan2(z, x), s.angle);
    if (dist < STATION_RADIUS && delta < Math.PI / 2 && dist * Math.sin(delta) < PATH_WIDTH / 2 + pad) return false;
  }
  if (Math.hypot(x - SPAWN[0], z - SPAWN[1]) < 3 + pad) return false;
  return true;
}

const SCENERY = (() => {
  const rand = seededRandom(42);
  const trees: { x: number; z: number; scale: number; round: boolean; rot: number }[] = [];
  const rocks: { x: number; z: number; scale: number; rot: number }[] = [];
  const flowers: { x: number; z: number; color: string }[] = [];
  const flowerColors = ['#f4a261', '#e76f51', '#fefae0', '#f2cc8f', '#c77dff', '#ff8fab'];

  for (let attempt = 0; attempt < 3000 && trees.length < 95; attempt++) {
    const angle = rand() * Math.PI * 2;
    const r = 7 + rand() * (WORLD_RADIUS + 16 - 7);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (r < 22 && rand() < 0.7) continue;
    if (!isClearGround(x, z, 1.8)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.8)) continue;
    trees.push({ x, z, scale: 0.8 + rand() * 0.7, round: rand() < 0.35, rot: rand() * Math.PI });
  }

  for (let attempt = 0; attempt < 1000 && rocks.length < 30; attempt++) {
    const angle = rand() * Math.PI * 2;
    const r = 6 + rand() * (WORLD_RADIUS + 6 - 6);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (!isClearGround(x, z, 1)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2)) continue;
    rocks.push({ x, z, scale: 0.25 + rand() * 0.6, rot: rand() * Math.PI });
  }

  for (let cluster = 0; cluster < 26; cluster++) {
    const angle = rand() * Math.PI * 2;
    const r = 5.5 + rand() * 20;
    const cx = Math.cos(angle) * r;
    const cz = Math.sin(angle) * r;
    const color = flowerColors[Math.floor(rand() * flowerColors.length)];
    const count = 5 + Math.floor(rand() * 7);
    for (let i = 0; i < count; i++) {
      const x = cx + (rand() - 0.5) * 2.2;
      const z = cz + (rand() - 0.5) * 2.2;
      if (isClearGround(x, z, 0.3)) flowers.push({ x, z, color });
    }
  }

  return { trees, rocks, flowers };
})();

const COLLIDERS: Collider[] = [
  ...SCENERY.trees.map((t) => ({ x: t.x, z: t.z, r: 0.45 * t.scale, h: 99 })),
  ...SCENERY.rocks
    .filter((r) => r.scale > 0.45)
    .map((r) => ({ x: r.x, z: r.z, r: r.scale * 0.9, h: r.scale * 0.8 })),
  ...STATIONS.map((s) => ({ x: s.x, z: s.z, r: 0.85, h: 1.15 })),
];

const PLATFORM_TOP = 0.245;
const PLAZA_TOP = 0.035;

function groundAt(x: number, z: number) {
  for (const s of STATIONS) {
    if (Math.hypot(x - s.x, z - s.z) < PLATFORM_RADIUS + 0.05) return PLATFORM_TOP;
  }
  return Math.hypot(x, z) < PLAZA_RADIUS ? PLAZA_TOP : 0;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

function useFadeTarget(
  targets: MutableRefObject<FadeTarget[]>,
  x: number,
  z: number,
  halfWidth: number,
  materialRefs: RefObject<THREE.Material>[],
) {
  useEffect(() => {
    const target: FadeTarget = {
      x,
      z,
      halfWidth,
      materials: materialRefs.map((ref) => ref.current).filter((m): m is THREE.Material => !!m),
    };
    const list = targets.current;
    list.push(target);
    return () => {
      const i = list.indexOf(target);
      if (i >= 0) list.splice(i, 1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, x, z, halfWidth]);
}

function Ground() {
  const grass = useDisposable(() => createGrassTexture(56), []);
  const plazaStone = useDisposable(() => createStoneTexture(2.5), []);
  const pathLength = STATION_RADIUS - PLAZA_RADIUS - PLATFORM_RADIUS + 1.2;
  const pathStone = useDisposable(() => createStoneTexture(1, pathLength / PATH_WIDTH), [pathLength]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[140, 64]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position-y={0.03} receiveShadow>
        <circleGeometry args={[PLAZA_RADIUS, 48]} />
        <meshStandardMaterial map={plazaStone} roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.04}>
        <ringGeometry args={[PLAZA_RADIUS - 0.25, PLAZA_RADIUS, 64]} />
        <meshStandardMaterial color="#78716c" roughness={0.8} />
      </mesh>

      {STATIONS.map((s) => {
        const mid = PLAZA_RADIUS - 0.6 + pathLength / 2;
        const rotY = Math.atan2(-Math.cos(s.angle), -Math.sin(s.angle));
        return (
          <group
            key={s.section.id}
            position={[Math.cos(s.angle) * mid, 0.02, Math.sin(s.angle) * mid]}
            rotation-y={rotY}
          >
            <mesh rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[PATH_WIDTH, pathLength]} />
              <meshStandardMaterial map={pathStone} roughness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Trees() {
  const pines = SCENERY.trees.filter((t) => !t.round);
  const rounds = SCENERY.trees.filter((t) => t.round);
  const trunk = useDisposable(() => createOccludingMaterial({ color: '#6b4f3a', roughness: 1 }), []);
  const pineLow = useDisposable(
    () => createOccludingMaterial({ color: '#2f5d3a', roughness: 0.9, flatShading: true }),
    [],
  );
  const pineHigh = useDisposable(
    () => createOccludingMaterial({ color: '#3b7048', roughness: 0.9, flatShading: true }),
    [],
  );
  const leafy = useDisposable(
    () => createOccludingMaterial({ color: '#5b8c4a', roughness: 0.9, flatShading: true }),
    [],
  );
  const stone = useDisposable(
    () => createOccludingMaterial({ color: '#8f8a84', roughness: 1, flatShading: true }),
    [],
  );

  return (
    <group>
      <Instances limit={SCENERY.trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.26, 1.3, 8]} />
        <primitive object={trunk} attach="material" />
        {SCENERY.trees.map((t, i) => (
          <Instance key={i} position={[t.x, 0.65 * t.scale, t.z]} scale={t.scale} />
        ))}
      </Instances>

      <Instances limit={pines.length} castShadow receiveShadow>
        <coneGeometry args={[1.25, 2.1, 8]} />
        <primitive object={pineLow} attach="material" />
        {pines.map((t, i) => (
          <Instance key={i} position={[t.x, 2.0 * t.scale, t.z]} scale={t.scale} rotation-y={t.rot} />
        ))}
      </Instances>
      <Instances limit={pines.length} castShadow>
        <coneGeometry args={[0.9, 1.7, 8]} />
        <primitive object={pineHigh} attach="material" />
        {pines.map((t, i) => (
          <Instance key={i} position={[t.x, 3.0 * t.scale, t.z]} scale={t.scale} rotation-y={t.rot + 0.4} />
        ))}
      </Instances>

      <Instances limit={rounds.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1.25, 1]} />
        <primitive object={leafy} attach="material" />
        {rounds.map((t, i) => (
          <Instance key={i} position={[t.x, 2.2 * t.scale, t.z]} scale={t.scale} rotation-y={t.rot} />
        ))}
      </Instances>

      <Instances limit={SCENERY.rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <primitive object={stone} attach="material" />
        {SCENERY.rocks.map((r, i) => (
          <Instance
            key={i}
            position={[r.x, r.scale * 0.35, r.z]}
            scale={[r.scale * 1.2, r.scale * 0.75, r.scale]}
            rotation={[0, r.rot, 0.2]}
          />
        ))}
      </Instances>

      <Instances limit={SCENERY.flowers.length}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial roughness={0.6} />
        {SCENERY.flowers.map((f, i) => (
          <Instance key={i} position={[f.x, 0.15, f.z]} color={f.color} />
        ))}
      </Instances>
    </group>
  );
}

function Clouds() {
  const group = useRef<THREE.Group>(null!);
  const puffs = useMemo(() => {
    const rand = seededRandom(99);
    const list: { position: [number, number, number]; scale: number }[] = [];
    for (let c = 0; c < 10; c++) {
      const angle = (c / 10) * Math.PI * 2 + rand();
      const r = 30 + rand() * 40;
      const cx = Math.cos(angle) * r;
      const cz = Math.sin(angle) * r;
      const cy = 26 + rand() * 10;
      for (let p = 0; p < 5; p++) {
        list.push({
          position: [cx + (p - 2) * 2.2 + rand(), cy + rand() * 1.2, cz + (rand() - 0.5) * 2.5],
          scale: 1.6 + rand() * 1.8 - Math.abs(p - 2) * 0.4,
        });
      }
    }
    return list;
  }, []);

  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.01;
  });

  return (
    <group ref={group}>
      <Instances limit={puffs.length}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.25} />
        {puffs.map((p, i) => (
          <Instance key={i} position={p.position} scale={p.scale} />
        ))}
      </Instances>
    </group>
  );
}

function StationIcon({ id, color }: { id: string; color: string }) {
  const spin = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    spin.current.rotation.y += dt * 0.7;
  });

  const star = useDisposable(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.62 : 0.27;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  const material = <meshStandardMaterial color={color} metalness={0.25} roughness={0.35} />;
  const gold = <meshStandardMaterial color="#e6b84f" metalness={0.8} roughness={0.25} />;
  const paper = <meshStandardMaterial color="#fbf8f2" roughness={0.8} />;

  let icon: React.ReactNode;
  switch (id) {
    case 'about':
      icon = (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.48, 32, 16]} />
            {material}
          </mesh>
          <mesh rotation={[1.2, 0, 0.3]}>
            <torusGeometry args={[0.78, 0.05, 12, 48]} />
            {gold}
          </mesh>
        </group>
      );
      break;
    case 'experience':
      icon = (
        <group>
          <RoundedBox args={[1.1, 0.75, 0.42]} radius={0.08} castShadow>
            {material}
          </RoundedBox>
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.2, 0.05, 8, 24, Math.PI]} />
            {gold}
          </mesh>
          <mesh position={[0, 0.05, 0.22]}>
            <boxGeometry args={[0.18, 0.12, 0.04]} />
            {gold}
          </mesh>
        </group>
      );
      break;
    case 'projects':
      icon = (
        <mesh castShadow>
          <torusKnotGeometry args={[0.38, 0.13, 120, 16]} />
          {material}
        </mesh>
      );
      break;
    case 'hackathons':
      icon = (
        <group position={[0, -0.1, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.22, 0.6, 24, 1, true]} />
            <meshStandardMaterial color="#e6b84f" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.45, 0.4, 0]} rotation-z={Math.PI / 2}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI]} />
            {gold}
          </mesh>
          <mesh position={[-0.45, 0.4, 0]} rotation-z={-Math.PI / 2}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI]} />
            {gold}
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
            {gold}
          </mesh>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.5, 0.14, 0.5]} />
            {material}
          </mesh>
        </group>
      );
      break;
    case 'leadership':
      icon = (
        <mesh geometry={star} castShadow>
          {gold}
        </mesh>
      );
      break;
    case 'learning':
      icon = (
        <group>
          <mesh position={[-0.3, 0, 0]} rotation-z={0.3} castShadow>
            <boxGeometry args={[0.6, 0.05, 0.8]} />
            {material}
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation-z={-0.3} castShadow>
            <boxGeometry args={[0.6, 0.05, 0.8]} />
            {material}
          </mesh>
          <mesh position={[-0.28, 0.05, 0]} rotation-z={0.3}>
            <boxGeometry args={[0.54, 0.05, 0.74]} />
            {paper}
          </mesh>
          <mesh position={[0.28, 0.05, 0]} rotation-z={-0.3}>
            <boxGeometry args={[0.54, 0.05, 0.74]} />
            {paper}
          </mesh>
        </group>
      );
      break;
    default:
      icon = (
        <mesh castShadow>
          <dodecahedronGeometry args={[0.5]} />
          {material}
        </mesh>
      );
  }

  return <group ref={spin}>{icon}</group>;
}

function Beacon({ color }: { color: string }) {
  const material = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock }) => {
    material.current.opacity = 0.12 + Math.sin(clock.elapsedTime * 2) * 0.05;
  });
  return (
    <mesh position={[0, 15, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 30, 16, 1, true]} />
      <meshBasicMaterial
        ref={material}
        color={color}
        transparent
        opacity={0.15}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface StationProps {
  section: Section;
  x: number;
  z: number;
  active: boolean;
  visited: boolean;
  fadeTargets: MutableRefObject<FadeTarget[]>;
}

function Station({ section, x, z, active, visited, fadeTargets }: StationProps) {
  const signTexture = useDisposable(
    () => createSignTexture(section.title, section.tagline, section.color),
    [section],
  );
  const platformStone = useDisposable(() => createStoneTexture(1.5), []);
  const signMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const frameMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const edgeGlowMaterial = useRef<THREE.MeshStandardMaterial>(null);
  
  const fadeProgress = useRef(0);
  const labelGroup = useRef<THREE.Group>(null!);
  
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  useFadeTarget(fadeTargets, x, z, 2.4, [signMaterial, frameMaterial]);

  useFrame((_, dt) => {
    if (fadeProgress.current < 1) {
      fadeProgress.current = Math.min(1, fadeProgress.current + dt * 1.5);
      
      const t = prefersReducedMotion 
        ? fadeProgress.current 
        : easeInOutCubic(fadeProgress.current);
      
      if (signMaterial.current) {
        signMaterial.current.opacity = t;
      }
      if (frameMaterial.current) {
        frameMaterial.current.opacity = 0.15 + t * 0.2;
      }
      if (edgeGlowMaterial.current) {
        edgeGlowMaterial.current.opacity = t * 0.4;
      }
      
      if (!prefersReducedMotion && labelGroup.current) {
        labelGroup.current.position.y = 4.8 - (1 - t) * 0.3;
        labelGroup.current.scale.setScalar(0.92 + t * 0.08);
      }
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.12} receiveShadow castShadow>
        <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS + 0.15, 0.25, 48]} />
        <meshStandardMaterial map={platformStone} roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.26}>
        <ringGeometry args={[PLATFORM_RADIUS - 0.4, PLATFORM_RADIUS - 0.15, 64]} />
        <meshStandardMaterial
          color={section.color}
          emissive={section.color}
          emissiveIntensity={active ? 1.6 : 0.35}
          roughness={0.5}
        />
      </mesh>

      <mesh position-y={0.7} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.9, 24]} />
        <meshStandardMaterial color="#e7e0d6" roughness={0.8} />
      </mesh>

      <Float speed={2} rotationIntensity={0.35} floatIntensity={0.6}>
        <group position-y={2.1} scale={active ? 1.2 : 1}>
          <StationIcon id={section.id} color={section.color} />
        </group>
      </Float>

      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.3} floatingRange={[-0.08, 0.08]}>
        <group ref={labelGroup} position-y={4.8}>
          <mesh>
            <planeGeometry args={[4.4, 2.4]} />
            <meshBasicMaterial ref={signMaterial} map={signTexture} transparent toneMapped={false} opacity={0} />
          </mesh>
          <mesh position-z={-0.07} castShadow receiveShadow>
            <boxGeometry args={[4.62, 2.62, 0.1]} />
            <meshPhysicalMaterial
              ref={frameMaterial}
              color="#ffffff"
              transparent
              opacity={0.35}
              transmission={0.6}
              thickness={0.5}
              roughness={0.1}
              metalness={0}
              clearcoat={0.1}
              ior={1.45}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh position-z={-0.06} scale={[1.01, 1.01, 1]}>
            <boxGeometry args={[4.62, 2.62, 0.05]} />
            <meshStandardMaterial
              ref={edgeGlowMaterial}
              color={section.color}
              emissive={section.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0}
              side={THREE.FrontSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      </Float>

      <pointLight position={[0, 2.4, 0]} color={section.color} intensity={active ? 30 : 8} distance={9} decay={2} />
      {!visited && <Beacon color={section.color} />}
    </group>
  );
}

function Banner({ fadeTargets }: { fadeTargets: MutableRefObject<FadeTarget[]> }) {
  const texture = useDisposable(
    () => createBannerTexture("Hi, I'm Maheen", 'Visit all stations for a surprise'),
    [],
  );
  const material = useRef<THREE.MeshBasicMaterial>(null);
  useFadeTarget(fadeTargets, 0, -1, 4.5, [material]);

  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.4} floatingRange={[-0.1, 0.1]}>
      <mesh position={[0, 5.6, -1]}>
        <planeGeometry args={[9, 9 / (1536 / 420)]} />
        <meshBasicMaterial ref={material} map={texture} transparent toneMapped={false} />
      </mesh>
    </Float>
  );
}

interface PlayerProps {
  state: MutableRefObject<PlayerState>;
  input: MutableRefObject<InputState>;
  zoom: MutableRefObject<number>;
  teleport: MutableRefObject<Teleport | null>;
  sun: MutableRefObject<THREE.DirectionalLight | null>;
  fx: MutableRefObject<WorldFx>;
  fadeTargets: MutableRefObject<FadeTarget[]>;
  dynamicColliders: MutableRefObject<Collider[]>;
  clouds: MutableRefObject<ParticleApi | null>;
  onMove: (x: number, z: number, heading: number) => void;
  onActiveChange: (id: string | null) => void;
}

function Player({
  state,
  input,
  zoom,
  teleport,
  sun,
  fx,
  fadeTargets,
  dynamicColliders,
  clouds,
  onMove,
  onActiveChange,
}: PlayerProps) {
  const root = useRef<THREE.Group>(null!);
  const lift = useRef<THREE.Group>(null!);
  const flipPivot = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null!);
  const rig = useRef(createRig());
  const { camera } = useThree();

  const view = useMemo(
    () => ({
      base: new THREE.Vector3(),
      look: new THREE.Vector3(SPAWN[0], 1.2, SPAWN[1]),
      desired: new THREE.Vector3(),
      target: new THREE.Vector3(),
      zoomBoost: 1,
      sinceReport: 0,
      active: null as string | null,
    }),
    [],
  );

  useEffect(() => {
    const s = state.current;
    view.base.copy(s.pos).add(CAMERA_OFFSET);
    camera.position.copy(view.base);
    camera.lookAt(view.look);
  }, [camera, state, view]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const keys = input.current;
    const t = clock.elapsedTime;

    if (teleport.current) {
      s.pos.set(teleport.current.x, 0, teleport.current.z);
      s.vel.set(0, 0, 0);
      teleport.current = null;
    }

    const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const dz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    view.target.set(dx, 0, dz);
    if (view.target.lengthSq() > 0) view.target.normalize().multiplyScalar(keys.run ? RUN_SPEED : WALK_SPEED);
    s.vel.lerp(view.target, 1 - Math.exp(-12 * dt));
    s.pos.addScaledVector(s.vel, dt);

    while (keys.jumpRequests > 0) {
      keys.jumpRequests--;
      if (s.grounded) {
        s.grounded = false;
        s.vy = JUMP_VELOCITY;
        s.jumps = 1;
        clouds.current?.burst(s.pos.x, 0.1, s.pos.z, { count: 6, speed: 1.6, size: 0.22, life: 0.4, rise: 0.3 });
      } else if (s.jumps < 2) {
        s.vy = DOUBLE_JUMP_VELOCITY;
        s.jumps = 2;
        s.flip = 0;
        clouds.current?.burst(s.pos.x, s.y + 0.15, s.pos.z, {
          count: 16,
          ring: true,
          speed: 4.5,
          size: 0.5,
          life: 0.75,
          rise: -0.5,
        });
      }
    }

    if (!s.grounded) {
      s.vy -= GRAVITY * dt;
      s.y += s.vy * dt;
      if (s.y <= 0) {
        const impact = s.vy;
        s.y = 0;
        s.vy = 0;
        s.grounded = true;
        s.jumps = 0;
        s.flip = -1;
        if (impact < -8) {
          clouds.current?.burst(s.pos.x, 0.1, s.pos.z, { count: 8, ring: true, speed: 2.5, size: 0.3, life: 0.45, rise: 0.2 });
        }
      }
    }
    if (s.flip >= 0) {
      s.flip += dt / FLIP_DURATION;
      if (s.flip >= 1) s.flip = -1;
    }
    s.invuln = Math.max(0, s.invuln - dt);
    s.shootTimer = Math.max(0, s.shootTimer - dt);

    const resolve = (c: Collider) => {
      if (s.y > c.h) return;
      const ox = s.pos.x - c.x;
      const oz = s.pos.z - c.z;
      const min = c.r + PLAYER_RADIUS;
      const d2 = ox * ox + oz * oz;
      if (d2 < min * min && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        s.pos.x = c.x + (ox / d) * min;
        s.pos.z = c.z + (oz / d) * min;
      }
    };
    COLLIDERS.forEach(resolve);
    dynamicColliders.current.forEach(resolve);
    const dist = Math.hypot(s.pos.x, s.pos.z);
    if (dist > WORLD_RADIUS) {
      s.pos.x *= WORLD_RADIUS / dist;
      s.pos.z *= WORLD_RADIUS / dist;
    }

    const speed = Math.hypot(s.vel.x, s.vel.z);
    const moving = speed > 0.3;
    if (moving && s.shootTimer <= 0) {
      s.heading = lerpAngle(s.heading, Math.atan2(s.vel.x, s.vel.z), 1 - Math.exp(-14 * dt));
    }
    if (moving) s.walk += dt * speed * 1.7;

    s.ground = damp(s.ground, groundAt(s.pos.x, s.pos.z), 18, dt);
    root.current.position.set(s.pos.x, 0, s.pos.z);
    lift.current.position.y = s.ground + s.y;
    shadow.current.position.y = s.ground + 0.03;
    lift.current.rotation.y = s.heading;
    lift.current.visible = s.invuln > 0 ? Math.floor(t * 16) % 2 === 0 : true;
    flipPivot.current.rotation.x = s.flip >= 0 ? easeInOutCubic(s.flip) * Math.PI * 2 : 0;
    const shadowScale = 1 / (1 + s.y * 0.35);
    shadow.current.scale.set(shadowScale, shadowScale, shadowScale);
    shadowMaterial.current.opacity = 0.2 * shadowScale;

    animateCharacter(rig.current, {
      dt,
      time: t,
      phase: s.walk,
      speed,
      runSpeed: RUN_SPEED,
      moving,
      grounded: s.grounded,
      rising: s.vy > 0,
      flipping: s.flip >= 0,
      shooting: s.shootTimer > 0,
    });

    view.zoomBoost = damp(view.zoomBoost, fx.current.zoomBoost, 2, dt);
    view.desired
      .copy(s.pos)
      .addScaledVector(CAMERA_OFFSET, zoom.current * view.zoomBoost)
      .setY(view.desired.y + s.ground + s.y * 0.4);
    view.base.lerp(view.desired, 1 - Math.exp(-5 * dt));
    view.look.lerp(view.target.set(s.pos.x, 1.2 + s.ground + s.y * 0.5, s.pos.z), 1 - Math.exp(-8 * dt));
    fx.current.shake *= Math.exp(-5 * dt);
    const shake = fx.current.shake;
    camera.position.copy(view.base);
    if (shake > 0.003) {
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
      camera.position.z += (Math.random() - 0.5) * shake;
    }
    camera.lookAt(view.look);
    occlusionUniforms.uOccCamera.value.copy(camera.position);
    occlusionUniforms.uOccPlayer.value.set(s.pos.x, s.ground + s.y + 1, s.pos.z);

    const light = sun.current;
    if (light) {
      light.position.set(s.pos.x + 18, 28, s.pos.z + 12);
      light.target.position.set(s.pos.x, 0, s.pos.z);
      light.target.updateMatrixWorld();
    }

    let nearest: string | null = null;
    let best = TRIGGER_RADIUS;
    for (const st of STATIONS) {
      const d = Math.hypot(s.pos.x - st.x, s.pos.z - st.z);
      if (d < best) {
        best = d;
        nearest = st.section.id;
      }
    }
    if (nearest !== view.active) {
      view.active = nearest;
      onActiveChange(nearest);
    }

    const reach = 12 * zoom.current * view.zoomBoost;
    for (const f of fadeTargets.current) {
      const ahead = f.z - s.pos.z;
      const occluding = ahead > 1.5 && ahead < reach && Math.abs(f.x - s.pos.x) < f.halfWidth + 0.8;
      const goal = occluding ? 0.18 : 1;
      for (const m of f.materials) {
        m.opacity = damp(m.opacity, goal, 10, dt);
        m.depthWrite = m.opacity > 0.95;
      }
    }

    view.sinceReport += dt;
    if (view.sinceReport > 0.1) {
      view.sinceReport = 0;
      onMove(s.pos.x, s.pos.z, s.heading);
    }
  });

  return (
    <group ref={root}>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position-y={0.03}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial ref={shadowMaterial} color="#000000" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <group ref={lift}>
        <group ref={flipPivot} position-y={1}>
          <group position-y={-1}>
            <Character rig={rig} />
          </group>
        </group>
      </group>
    </group>
  );
}

export interface WorldProps {
  input: MutableRefObject<InputState>;
  zoom: MutableRefObject<number>;
  teleport: MutableRefObject<Teleport | null>;
  activeId: string | null;
  visited: ReadonlySet<string>;
  fightRun: number;
  showBanner: boolean;
  onMove: (x: number, z: number, heading: number) => void;
  onActiveChange: (id: string | null) => void;
  onFightEvent: (event: FightEvent) => void;
}

export const World = memo(function World({
  input,
  zoom,
  teleport,
  activeId,
  visited,
  fightRun,
  showBanner,
  onMove,
  onActiveChange,
  onFightEvent,
}: WorldProps) {
  const sun = useRef<THREE.DirectionalLight | null>(null);
  const fadeTargets = useRef<FadeTarget[]>([]);
  const player = useRef<PlayerState>(createPlayerState(SPAWN[0], SPAWN[1]));
  const fx = useRef<WorldFx>({ shake: 0, zoomBoost: 1 });
  const dynamicColliders = useRef<Collider[]>([]);
  const clouds = useRef<ParticleApi | null>(null);
  const fire = useRef<ParticleApi | null>(null);

  return (
    <>
      <color attach="background" args={['#cfe0ea']} />
      <fog attach="fog" args={['#d7e5ec', 38, 115]} />
      <Sky sunPosition={[100, 45, 60]} turbidity={4} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.85} />

      <hemisphereLight args={['#e0efff', '#5f7d4a', 1.1]} />
      <directionalLight
        ref={sun}
        intensity={2.4}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      <Ground />
      <Trees />
      <Clouds />
      {showBanner && <Banner fadeTargets={fadeTargets} />}
      {STATIONS.map((s) => (
        <Station
          key={s.section.id}
          section={s.section}
          x={s.x}
          z={s.z}
          active={activeId === s.section.id}
          visited={visited.has(s.section.id)}
          fadeTargets={fadeTargets}
        />
      ))}
      <Player
        state={player}
        input={input}
        zoom={zoom}
        teleport={teleport}
        sun={sun}
        fx={fx}
        fadeTargets={fadeTargets}
        dynamicColliders={dynamicColliders}
        clouds={clouds}
        onMove={onMove}
        onActiveChange={onActiveChange}
      />
      <BossFight
        run={fightRun}
        input={input}
        player={player}
        fx={fx}
        dynamicColliders={dynamicColliders}
        clouds={clouds}
        fire={fire}
        onEvent={onFightEvent}
      />
      <Particles apiRef={clouds} kind="cloud" max={500} />
      <Particles apiRef={fire} kind="fire" max={700} />
    </>
  );
});

