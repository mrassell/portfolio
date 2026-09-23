'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;

// Simple layered sine waves rendered as a filled gradient field.
float waveHeight(float x, float t) {
  float y = 0.0;
  y += sin(x * 2.2 + t * 0.9) * 0.16;
  y += sin(x * 4.1 - t * 1.3) * 0.09;
  y += sin(x * 7.5 + t * 0.6) * 0.045;
  y += sin(x * 13.0 - t * 2.1) * 0.02;
  return y;
}

vec3 layerColor(float depth, vec3 base) {
  return mix(base, vec3(1.0), depth * 0.18);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime;
  vec3 color = vec3(0.98, 0.97, 0.96);

  vec3 palette[4];
  palette[0] = vec3(0.965, 0.945, 0.914); // warm sand
  palette[1] = vec3(0.851, 0.788, 0.702); // stone
  palette[2] = vec3(0.635, 0.573, 0.482); // deeper stone
  palette[3] = vec3(0.267, 0.235, 0.208); // near-black stone

  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float speed = 0.5 + fi * 0.18;
    float freq = 1.4 + fi * 0.55;
    float amp = 0.22 - fi * 0.035;
    float offset = -0.42 - fi * 0.16;

    float h = sin(p.x * freq + t * speed + fi * 1.7) * amp
            + sin(p.x * freq * 2.3 - t * speed * 0.7 + fi) * amp * 0.35;

    float lineY = offset + h;
    float dist = p.y - lineY;

    if (dist < 0.0) {
      color = palette[i];
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

export default function WaveHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!glContext || !(glContext instanceof WebGLRenderingContext)) {
      return;
    }
    const gl: WebGLRenderingContext = glContext;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');

    let rafId = 0;
    let disposed = false;
    const start = performance.now();

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function render() {
      if (disposed) return;
      resize();
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    rafId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
