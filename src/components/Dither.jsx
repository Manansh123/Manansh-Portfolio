import { useEffect, useRef } from "react";
import { finePointer } from "../lib/device";
import { createProgram, getContext, startLoop } from "../lib/gl";
import { hexToRgb } from "../lib/color";

// Dithered noise waves in one raw WebGL pass. The canvas is drawn at one texel
// per dither cell and scaled up with nearest-neighbour sampling, so the GPU
// shades roughly 1/6 of the pixels a full-resolution pass would.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float time;
uniform vec2 mouse;
uniform float mouseOn;
uniform vec3 waveColor;
uniform vec3 bgColor;

const float SPEED = 0.06;
const float FREQ = 2.4;
const float AMP = 0.35;
const float LEVELS = 4.0;
const float RADIUS = 0.35;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz; vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz; vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  gx = gx - floor(gx + 0.5);
  vec2 g00 = vec2(gx.x, gy.x); vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z); vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 f = fade(Pf.xy);
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), f.x);
  return 2.3 * mix(nx.x, nx.y, f.y);
}

float fbm(vec2 p) {
  float v = 0.0; float a = 1.0;
  for (int i = 0; i < 4; i++) { v += a * abs(cnoise(p)); p *= FREQ; a *= AMP; }
  return v;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) {
  return bayer2(a) + bayer2(floor(a * 0.5)) * 0.25;
}
float bayer8(vec2 a) {
  return bayer4(a) + bayer2(floor(a * 0.25)) * 0.0625;
}

void main() {
  vec2 uv = gl_FragCoord.xy / res - 0.5;
  uv.x *= res.x / res.y;

  float f = fbm(uv + fbm(uv - time * SPEED));

  vec2 m = mouse / res - 0.5;
  m.x *= res.x / res.y;
  float d = length(uv - m);
  float mouseEffect = 1.0 - smoothstep(0.0, RADIUS, d);
  f += 0.35 * mouseOn * mouseEffect;

  f = smoothstep(0.15, 0.85, f);

  float bayer = bayer8(gl_FragCoord.xy);
  float nLevels = LEVELS - 1.0;
  float dithered = floor(f * nLevels + bayer) / nLevels;
  dithered = clamp(dithered, 0.0, 1.0);

  vec3 col = mix(bgColor, waveColor, dithered);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Dither({
	color = "#7B353C",
	background = "#0b0b0e",
	cell = 2.5,
	interactive = true,
	className = "",
}) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const gl = canvas && getContext(canvas);
		if (!gl) return;
		const prog = createProgram(gl, VERT, FRAG);
		if (!prog) return;

		const u = (name) => gl.getUniformLocation(prog, name);
		const uRes = u("res");
		const uTime = u("time");
		const uMouse = u("mouse");
		const uMouseOn = u("mouseOn");
		gl.uniform3fv(u("waveColor"), hexToRgb(color));
		gl.uniform3fv(u("bgColor"), hexToRgb(background));

		const mouse = { x: -1e4, y: -1e4, on: 0, target: 0 };
		const draw = (time) => {
			mouse.on += (mouse.target - mouse.on) * 0.08;
			gl.uniform1f(uTime, time);
			gl.uniform2f(uMouse, mouse.x, mouse.y);
			gl.uniform1f(uMouseOn, mouse.on);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};

		// One canvas texel per dither cell, upscaled with nearest-neighbour
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const w = Math.max(1, Math.round(rect.width / cell));
			const h = Math.max(1, Math.round(rect.height / cell));
			canvas.width = w;
			canvas.height = h;
			gl.viewport(0, 0, w, h);
			gl.uniform2f(uRes, w, h);
		};
		resize();
		const loop = startLoop(canvas, draw, { startTime: 12 });
		const ro = new ResizeObserver(() => {
			resize();
			loop.redraw();
		});
		ro.observe(canvas);

		const onMove = (e) => {
			const rect = canvas.getBoundingClientRect();
			mouse.target =
				e.clientY >= rect.top && e.clientY <= rect.bottom ? 1 : 0;
			mouse.x = (e.clientX - rect.left) / cell;
			mouse.y = (rect.bottom - e.clientY) / cell;
		};
		if (interactive && finePointer) {
			window.addEventListener("pointermove", onMove, { passive: true });
		}

		return () => {
			loop.stop();
			ro.disconnect();
			window.removeEventListener("pointermove", onMove);
		};
	}, [color, background, cell, interactive]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={`block h-full w-full ${className}`}
			style={{ imageRendering: "pixelated", background }}
		/>
	);
}
