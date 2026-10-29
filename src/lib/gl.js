import { frameInterval, reduceMotion } from "./device";

export function createProgram(gl, vert, frag) {
	const compile = (type, src) => {
		const s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		return s;
	};
	const prog = gl.createProgram();
	gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
	gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
	gl.useProgram(prog);

	// One oversized triangle covers the screen
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const loc = gl.getAttribLocation(prog, "p");
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
	return prog;
}

export function getContext(canvas) {
	return canvas.getContext("webgl", {
		antialias: false,
		depth: false,
		stencil: false,
		alpha: false,
		powerPreference: "low-power",
	});
}

// Runs draw(time) only while the canvas is on screen and the tab is visible,
// capped to 30fps on low-power devices, and a single still frame when the
// visitor prefers reduced motion.
export function startLoop(canvas, draw, { startTime = 0 } = {}) {
	let raf = 0;
	let running = false;
	let inView = false;
	let time = startTime;
	let last = 0;
	let lastDraw = 0;

	const frame = (now) => {
		raf = requestAnimationFrame(frame);
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		time += dt;
		if (frameInterval && now - lastDraw < frameInterval) return;
		lastDraw = now;
		draw(time);
	};
	const start = () => {
		if (running || reduceMotion) return;
		running = true;
		last = performance.now();
		raf = requestAnimationFrame(frame);
	};
	const stop = () => {
		running = false;
		cancelAnimationFrame(raf);
	};

	const io = new IntersectionObserver(
		([entry]) => {
			inView = entry.isIntersecting;
			if (inView && !document.hidden) start();
			else stop();
		},
		{ rootMargin: "100px" },
	);
	io.observe(canvas);
	const onVisibility = () => (document.hidden ? stop() : inView && start());
	document.addEventListener("visibilitychange", onVisibility);

	draw(time);

	return {
		redraw: () => !running && draw(time),
		stop() {
			stop();
			io.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
		},
	};
}
