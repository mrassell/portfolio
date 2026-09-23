'use client';

import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface BurstOptions {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  life?: number;
  rise?: number;
  gravity?: number;
  ring?: boolean;
}

export interface ParticleApi {
  emit: (
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    size: number,
    life: number,
    color: string,
    gravity?: number,
  ) => void;
  burst: (x: number, y: number, z: number, options?: BurstOptions) => void;
}

interface ParticlesProps {
  apiRef: MutableRefObject<ParticleApi | null>;
  kind: 'cloud' | 'fire';
  max?: number;
}

export function Particles({ apiRef, kind, max = 400 }: ParticlesProps) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const data = useMemo(
    () => ({
      pos: new Float32Array(max * 3),
      vel: new Float32Array(max * 3),
      age: new Float32Array(max),
      life: new Float32Array(max),
      size: new Float32Array(max),
      gravity: new Float32Array(max),
      alive: new Uint8Array(max),
      next: 0,
      live: 0,
    }),
    [max],
  );
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      zero: new THREE.Matrix4().makeScale(0, 0, 0),
      color: new THREE.Color(),
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
    }),
    [],
  );

  useLayoutEffect(() => {
    const m = mesh.current;
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3).fill(1), 3);
    for (let i = 0; i < max; i++) m.setMatrixAt(i, scratch.zero);
    m.instanceMatrix.needsUpdate = true;

    const emit: ParticleApi['emit'] = (x, y, z, vx, vy, vz, size, life, color, gravity = 0) => {
      const i = data.next;
      data.next = (data.next + 1) % max;
      if (!data.alive[i]) data.live++;
      data.pos[i * 3] = x;
      data.pos[i * 3 + 1] = y;
      data.pos[i * 3 + 2] = z;
      data.vel[i * 3] = vx;
      data.vel[i * 3 + 1] = vy;
      data.vel[i * 3 + 2] = vz;
      data.age[i] = 0;
      data.life[i] = life;
      data.size[i] = size;
      data.gravity[i] = gravity;
      data.alive[i] = 1;
      m.setColorAt(i, scratch.color.set(color));
      m.instanceColor!.needsUpdate = true;
    };

    apiRef.current = {
      emit,
      burst(x, y, z, o = {}) {
        const count = o.count ?? 10;
        const speed = o.speed ?? 2.5;
        const size = o.size ?? 0.35;
        const life = o.life ?? 0.6;
        const rise = o.rise ?? 0.8;
        const color = o.color ?? '#ffffff';
        for (let k = 0; k < count; k++) {
          const angle = (k / count) * Math.PI * 2 + Math.random() * 0.6;
          const up = o.ring ? Math.random() * 0.3 : Math.random() * 1.6 - 0.4;
          const sp = speed * (0.6 + Math.random() * 0.7);
          emit(
            x + Math.cos(angle) * 0.2,
            y,
            z + Math.sin(angle) * 0.2,
            Math.cos(angle) * sp,
            rise + up * sp * 0.6,
            Math.sin(angle) * sp,
            size * (0.7 + Math.random() * 0.6),
            life * (0.8 + Math.random() * 0.4),
            color,
            o.gravity ?? 0,
          );
        }
      },
    };

    return () => {
      apiRef.current = null;
    };
  }, [apiRef, data, max, scratch]);

  useFrame((_, rawDt) => {
    if (data.live === 0) return;
    const dt = Math.min(rawDt, 0.05);
    const m = mesh.current;
    const drag = Math.exp(-2.5 * dt);

    for (let i = 0; i < max; i++) {
      if (!data.alive[i]) continue;
      data.age[i] += dt;
      const t = data.age[i] / data.life[i];
      if (t >= 1) {
        data.alive[i] = 0;
        data.live--;
        m.setMatrixAt(i, scratch.zero);
        continue;
      }
      const j = i * 3;
      data.vel[j] *= drag;
      data.vel[j + 1] = data.vel[j + 1] * drag - data.gravity[i] * dt;
      data.vel[j + 2] *= drag;
      data.pos[j] += data.vel[j] * dt;
      data.pos[j + 1] += data.vel[j + 1] * dt;
      data.pos[j + 2] += data.vel[j + 2] * dt;

      const s = data.size[i] * Math.sin(Math.PI * Math.pow(t, 0.55));
      scratch.position.set(data.pos[j], data.pos[j + 1], data.pos[j + 2]);
      scratch.scale.setScalar(Math.max(s, 0.0001));
      scratch.matrix.compose(scratch.position, scratch.quaternion, scratch.scale);
      m.setMatrixAt(i, scratch.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, max]} frustumCulled={false}>
      <icosahedronGeometry args={[1, kind === 'cloud' ? 1 : 0]} />
      {kind === 'cloud' ? (
        <meshStandardMaterial roughness={1} flatShading emissive="#ffffff" emissiveIntensity={0.15} />
      ) : (
        <meshBasicMaterial toneMapped={false} />
      )}
    </instancedMesh>
  );
}
