import { useEffect, useRef } from "react";
import { lowPower } from "../lib/device";
import { createProgram, getContext, startLoop } from "../lib/gl";
import { hexToRgb } from "../lib/color";

// Port of React Bits' FaultyTerminal to raw WebGL, tuned with the settings the
// Toolbox section uses. The noise field is sampled once per glyph cell instead
// of once per blur tap, which makes it about ten times cheaper to shade.

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float iTime;
uniform vec3 uTint;
uniform vec2 uRes;

const float SCALE = 1.0;
const float DIGIT = 1.25;
const float SCAN = 0.45;
const float GLITCH = 0.6;
const float FLICKER = 0.3;
const float NOISE_AMP = 0.85;
const float CURVE = 0.08;

float t3;

float noise(vec2 p) { return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(t3 * 0.090909))) + 0.2; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float fbm(vec2 p) {
  p *= 1.1;
  float f = 0.0, amp = 0.5 * NOISE_AMP;
  f += amp * noise(p); p = rot(t3 * 0.02) * p * 2.0; amp *= 0.454545;
  f += amp * noise(p); p = rot(t3 * 0.02) * p * 2.0; amp *= 0.454545;
  f += amp * noise(p);
  return f;
}

float pattern(vec2 p) {
  vec2 q = vec2(fbm(p + 1.0), fbm(rot(0.1 * t3) * p + 1.0));
  vec2 r = vec2(fbm(rot(0.1) * q), fbm(q));
  return fbm(p + r);
}

float glyph(vec2 p, vec2 grid, float intensity) {
  vec2 cell = fract(p * grid);
  if (cell.x > 0.82 || cell.y > 0.88) return 0.0;
  cell = vec2(cell.x / 0.82, cell.y / 0.88);
  float px5 = cell.x * 5.0, py5 = (1.0 - cell.y) * 5.0;
  float x = fract(px5), y = fract(py5);
  float i = floor(py5) - 2.0, j = floor(px5) - 2.0;
  float on = step(0.1, intensity - (i * i + j * j) * 0.065);
  float b = on * (0.35 + y * 0.65) * (0.75 + x * 0.25);
  return step(0.0, cell.x) * step(cell.x, 1.0) * step(0.0, cell.y) * step(cell.y, 1.0) * b;
}

float onOff(float a, float b, float c) { return step(c, sin(iTime + a * cos(iTime * b))) * FLICKER; }

float displace(vec2 look) {
  float y = look.y - mod(iTime * 0.25, 1.0);
  float window = 1.0 / (1.0 + 50.0 * y * y);
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

void main() {
  t3 = iTime * 0.333333;
  vec2 c = vUv * 2.0 - 1.0;
  c *= 1.0 + CURVE * dot(c, c);
  vec2 p = (c * 0.5 + 0.5) * SCALE;

  float aspect = uRes.x / max(1.0, uRes.y);
  vec2 grid = vec2(floor(32.0 * max(1.0, aspect)), 22.0);

  float bar = (step(mod(p.y * grid.y * 0.5 + t3 * 15.0, 1.0), 0.25) * 0.4 + 1.0) * SCAN;
  p.x += displace(p) * GLITCH;

  vec2 s = floor(p * grid) / grid;
  float intensity = pattern(s * 0.1) * 1.45 + 0.06;

  float middle = glyph(p, grid, intensity);
  const float o = 0.002;
  float sum = glyph(p + vec2(-o, -o), grid, intensity) + glyph(p + vec2(0.0, -o), grid, intensity) + glyph(p + vec2(o, -o), grid, intensity)
            + glyph(p + vec2(-o, 0.0), grid, intensity) + middle + glyph(p + vec2(o, 0.0), grid, intensity)
            + glyph(p + vec2(-o, o), grid, intensity) + glyph(p + vec2(o, o), grid, intensity) + glyph(p + vec2(o, o), grid, intensity);

  vec3 col = (vec3(1.3) * middle + sum * 0.22 * bar) * uTint;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function FaultyTerminal({ tint = "#883B42", className = "" }) {
	const canvasRef = useRef(null);
	const tintRef = useRef(hexToRgb(tint));
	const redrawRef = useRef(null);

	useEffect(() => {
		tintRef.current = hexToRgb(tint);
		redrawRef.current?.();
	}, [tint]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const gl = canvas && getContext(canvas);
		if (!gl) return;
		const prog = createProgram(gl, VERT, FRAG);
		if (!prog) return;

		const uTime = gl.getUniformLocation(prog, "iTime");
		const uTint = gl.getUniformLocation(prog, "uTint");
		const uRes = gl.getUniformLocation(prog, "uRes");
		const current = [...tintRef.current];
		const dpr = lowPower ? 0.5 : 0.75;
		const offset = Math.random() * 100;

		const draw = (time) => {
			// Ease towards the active category's colour
			for (let i = 0; i < 3; i++) current[i] += (tintRef.current[i] - current[i]) * 0.06;
			gl.uniform1f(uTime, (time + offset) * 0.35);
			gl.uniform3fv(uTint, current);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = Math.max(1, Math.round(rect.width * dpr));
			canvas.height = Math.max(1, Math.round(rect.height * dpr));
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.uniform2f(uRes, canvas.width, canvas.height);
		};
		resize();
		const loop = startLoop(canvas, draw);
		redrawRef.current = () => {
			current.splice(0, 3, ...tintRef.current);
			loop.redraw();
		};
		const ro = new ResizeObserver(() => {
			resize();
			loop.redraw();
		});
		ro.observe(canvas);

		return () => {
			loop.stop();
			ro.disconnect();
			redrawRef.current = null;
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={`block h-full w-full ${className}`}
			style={{ background: "#000" }}
		/>
	);
}
