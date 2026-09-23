import * as THREE from 'three';

export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(canvas: HTMLCanvasElement, repeatX: number, repeatY = repeatX) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createGrassTexture(repeat: number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(7);

  ctx.fillStyle = '#6f9a4f';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 60; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 30 + rand() * 70;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = rand() > 0.5 ? '120,160,80' : '90,130,65';
    grad.addColorStop(0, `rgba(${tone},0.35)`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = grad;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.restore();
      }
    }
  }

  for (let i = 0; i < 9000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const shade = rand();
    ctx.strokeStyle =
      shade > 0.6 ? 'rgba(150,190,100,0.55)' : shade > 0.3 ? 'rgba(80,120,55,0.5)' : 'rgba(60,95,45,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 3, y - 2 - rand() * 4);
    ctx.stroke();
  }

  return toTexture(canvas, repeat);
}

export function createStoneTexture(repeatX: number, repeatY = repeatX) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(21);

  ctx.fillStyle = '#9c9186';
  ctx.fillRect(0, 0, size, size);

  const rows = 8;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : rowH * 0.6;
    let x = -offset;
    while (x < size) {
      const w = rowH * (0.9 + rand() * 0.8);
      const light = 180 + Math.floor(rand() * 40);
      ctx.fillStyle = `rgb(${light},${light - 8},${light - 18})`;
      ctx.beginPath();
      ctx.roundRect(x + 3, r * rowH + 3, w - 6, rowH - 6, 8);
      ctx.fill();
      for (let s = 0; s < 40; s++) {
        ctx.fillStyle = `rgba(0,0,0,${rand() * 0.08})`;
        ctx.fillRect(x + rand() * w, r * rowH + rand() * rowH, 2, 2);
      }
      x += w;
    }
  }

  return toTexture(canvas, repeatX, repeatY);
}

export function createStripeTexture(first: string, second: string, stripes: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = first;
  ctx.fillRect(0, 0, 16, 32);
  ctx.fillStyle = second;
  ctx.fillRect(0, 32, 16, 32);
  const texture = toTexture(canvas, 1, stripes);
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function createSignTexture(title: string, tagline: string, color: string, hint = 'Walk closer to read') {
  const w = 1024;
  const h = 560;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f7f3ec';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, 36);
  ctx.fillRect(0, h - 14, w, 14);

  ctx.fillStyle = '#1c1917';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 118px ${FONT}`;
  const titleLines = wrapLines(ctx, title, w - 120);
  const titleY = titleLines.length > 1 ? 190 : 240;
  titleLines.forEach((line, i) => ctx.fillText(line, w / 2, titleY + i * 124));

  ctx.fillStyle = '#57534e';
  ctx.font = `500 52px ${FONT}`;
  ctx.fillText(tagline, w / 2, titleLines.length > 1 ? 420 : 360);

  ctx.fillStyle = color;
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText(hint, w / 2, h - 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createBannerTexture(title: string, subtitle: string) {
  const w = 1536;
  const h = 420;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 48);
  ctx.fill();

  ctx.fillStyle = '#fafaf9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 170px ${FONT}`;
  ctx.fillText(title, w / 2, 170);

  ctx.fillStyle = '#d6d3d1';
  ctx.font = `500 56px ${FONT}`;
  ctx.fillText(subtitle, w / 2, 320);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
