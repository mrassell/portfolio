import * as THREE from 'three';

export const PLAYER_MAX_HP = 5;
export const BOSS_MAX_HP = 80;

export interface PlayerState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  ground: number;
  y: number;
  vy: number;
  heading: number;
  grounded: boolean;
  jumps: number;
  flip: number;
  walk: number;
  hp: number;
  invuln: number;
  shootTimer: number;
}

export function createPlayerState(x: number, z: number): PlayerState {
  return {
    pos: new THREE.Vector3(x, 0, z),
    vel: new THREE.Vector3(),
    ground: 0,
    y: 0,
    vy: 0,
    heading: Math.PI,
    grounded: true,
    jumps: 0,
    flip: -1,
    walk: 0,
    hp: PLAYER_MAX_HP,
    invuln: 0,
    shootTimer: 0,
  };
}

export interface WorldFx {
  shake: number;
  zoomBoost: number;
}

export interface Collider {
  x: number;
  z: number;
  r: number;
  h: number;
}

export type FightStatus = 'incoming' | 'fighting' | 'won' | 'lost';

export type FightEvent =
  | { type: 'bossHp'; hp: number }
  | { type: 'playerHp'; hp: number }
  | { type: 'status'; status: FightStatus };

export function lerpAngle(from: number, to: number, t: number) {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

export function damp(current: number, target: number, rate: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
