import { useEffect, useRef } from 'react';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jumpRequests: number;
  fireRequests: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const MAX_QUEUED_SHOTS = 3;

type HeldKey = Exclude<keyof InputState, 'jumpRequests' | 'fireRequests'>;

const KEY_MAP: Record<string, HeldKey> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
};

export function useInput() {
  const input = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    run: false,
    jumpRequests: 0,
    fireRequests: 0,
  });

  useEffect(() => {
    const state = input.current;

    const isTyping = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) state.jumpRequests++;
        return;
      }
      if (e.code === 'KeyF') {
        state.fireRequests = Math.min(MAX_QUEUED_SHOTS, state.fireRequests + 1);
        return;
      }
      const key = KEY_MAP[e.code];
      if (!key) return;
      if (key !== 'run') e.preventDefault();
      state[key] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.code];
      if (key) state[key] = false;
    };

    const reset = () => {
      state.up = state.down = state.left = state.right = state.run = false;
      state.jumpRequests = 0;
      state.fireRequests = 0;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', reset);
    };
  }, []);

  return input;
}
