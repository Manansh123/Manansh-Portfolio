import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { reduceMotion } from "../lib/device";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const FRAME = 16.667;

// Based on React Bits' CurvedLoop, rebuilt around a small physics loop:
//  - drag and flick with real momentum
//  - scrolling the page pushes the text (fast scroll, fast text)
//  - the curve behaves like a rope: it flattens when whipped, wobbles back,
//    and leans toward the cursor on hover
//  - hover eases the speed down so the words are readable
//  - click, Space or Enter pauses; arrow keys nudge (keyboard and WCAG 2.2.2 friendly)
// It only runs while it is on screen, and sleeps entirely when there is nothing to animate.
export default function CurvedLoop({
	text,
	speed = 1.2,
	curve = 90,
	className = "",
}) {
	const pathId = useId().replace(/:/g, "");
	const measureRef = useRef(null);
	const pathRef = useRef(null);
	const textPathRef = useRef(null);
	const wrapRef = useRef(null);
	const sim = useRef({});
	const [spacing, setSpacing] = useState(0);
	const [repeat, setRepeat] = useState(4);
	const [dragging, setDragging] = useState(false);
	const [paused, setPaused] = useState(false);
	// A narrower drawing area on phones keeps the words large
	const [vbW, setVbW] = useState(() =>
		typeof window !== "undefined" && window.innerWidth < 640 ? 760 : 1440,
	);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		const onChange = () => setVbW(mq.matches ? 760 : 1440);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	const content = text.endsWith(" ") ? text : `${text} `;
	// What a screen reader should hear: the words, not the decorations
	const spoken = text
		.split("✦")
		.map((s) => s.trim())
		.filter(Boolean)
		.join(", ");

	// Sparkle separators get the accent colour
	const renderRun = (key) =>
		content.split("✦").map((part, i, arr) => (
			<tspan key={`${key}-${i}`}>
				{part}
				{i < arr.length - 1 && <tspan className="curved-spark">✦</tspan>}
			</tspan>
		));

	useLayoutEffect(() => {
		const measure = () => {
			const len = measureRef.current?.getComputedTextLength() ?? 0;
			const pathLen = pathRef.current?.getTotalLength() ?? 1800;
			if (len) {
				setSpacing(len);
				setRepeat(Math.ceil(pathLen / len) + 2);
			}
		};
		measure();
		document.fonts?.ready.then(measure);
	}, [content, vbW]);

	useEffect(() => {
		if (!spacing) return;
		const wrap = wrapRef.current;
		const path = pathRef.current;
		const tp = textPathRef.current;
		const base = 40 + curve; // rest position of the curve's control point
		const makeD = (cy) =>
			`M-100,40 Q${vbW / 2},${cy.toFixed(2)} ${vbW + 100},40`;

		// Keep the offset inside one repeat of the text, whatever the jump
		const wrapOffset = (o) =>
			((((o + spacing) % spacing) + spacing) % spacing) - 2 * spacing;

		const s = sim.current;
		Object.assign(s, {
			offset: -spacing,
			vel: 0,
			dir: -1,
			hover: 0,
			hoverT: 0,
			py: 0.5,
			cy: base,
			cvy: 0,
			lastCy: base,
			sv: 0,
			lastScroll: window.scrollY,
			dragging: false,
			dragV: 0,
			lastX: 0,
			lastT: 0,
			moved: 0,
			paused: s.paused ?? false,
			visible: false,
			raf: 0,
			last: 0,
		});

		const paint = () => {
			tp.setAttribute("startOffset", `${s.offset.toFixed(2)}px`);
			if (Math.abs(s.cy - s.lastCy) > 0.02) {
				path.setAttribute("d", makeD(s.cy));
				s.lastCy = s.cy;
			}
		};

		const tick = (now) => {
			const dt = s.last ? clamp((now - s.last) / FRAME, 0.25, 3) : 1;
			s.last = now;

			// page scroll pushes the text: scroll down, it runs faster left
			let boost = 0;
			if (!reduceMotion) {
				const y = window.scrollY;
				s.sv += (y - s.lastScroll - s.sv) * (1 - Math.pow(0.85, dt));
				s.lastScroll = y;
				boost = clamp(-s.sv * 0.25, -10, 10);
			}
			s.hover += (s.hoverT - s.hover) * (1 - Math.pow(0.9, dt));

			// momentum: velocity eases toward the cruising speed, so a flick coasts out
			if (!s.dragging) {
				const cruise =
					s.paused || reduceMotion ? 0 : s.dir * speed * (1 - 0.8 * s.hover);
				const target = cruise + (s.paused ? 0 : boost);
				s.vel += (target - s.vel) * (1 - Math.pow(0.94, dt));
				s.offset = wrapOffset(s.offset + s.vel * dt);
			}

			// the rope: a damped spring on the curve's control point
			let targetY = base;
			if (!reduceMotion) {
				const lean = (s.py - 0.5) * 36 * s.hover;
				const whip = Math.min(Math.abs(s.vel), 24) * 1.1;
				targetY = base + lean - whip;
				s.cvy += (targetY - s.cy) * 0.09 * dt;
				s.cvy *= Math.pow(0.86, dt);
				s.cy += s.cvy * dt;
			}

			paint();

			const busy =
				s.dragging ||
				(!s.paused && !reduceMotion) ||
				Math.abs(s.vel) > 0.02 ||
				Math.abs(s.cvy) > 0.02 ||
				Math.abs(s.cy - targetY) > 0.05 ||
				Math.abs(s.sv) > 0.05 ||
				Math.abs(s.hover - s.hoverT) > 0.005;
			s.raf = s.visible && busy ? requestAnimationFrame(tick) : 0;
		};

		const wake = () => {
			if (s.visible && !s.raf) {
				s.last = 0;
				s.raf = requestAnimationFrame(tick);
			}
		};
		const toggle = () => {
			s.paused = !s.paused;
			setPaused(s.paused);
			wake();
		};

		paint();

		const io = new IntersectionObserver(([e]) => {
			s.visible = e.isIntersecting;
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			if (s.visible) {
				s.lastScroll = window.scrollY;
				wake();
			}
		});
		io.observe(wrap);

		/* pointer: hover, drag, flick, click-to-pause */
		const enter = (e) => {
			if (e.pointerType !== "mouse") return;
			s.hoverT = 1;
			wake();
		};
		const leave = () => {
			s.hoverT = 0;
			wake();
		};
		const down = (e) => {
			s.dragging = true;
			s.moved = 0;
			s.dragV = 0;
			s.lastX = e.clientX;
			s.lastT = e.timeStamp;
			setDragging(true);
			wrap.setPointerCapture?.(e.pointerId);
			wake();
		};
		const move = (e) => {
			if (e.pointerType === "mouse") {
				const r = wrap.getBoundingClientRect();
				s.py = clamp((e.clientY - r.top) / r.height, 0, 1);
				wake();
			}
			if (!s.dragging) return;
			const dx = e.clientX - s.lastX;
			const frames = Math.max(0.5, (e.timeStamp - s.lastT) / FRAME);
			s.lastX = e.clientX;
			s.lastT = e.timeStamp;
			s.moved += Math.abs(dx);
			s.offset = wrapOffset(s.offset + dx * 1.4);
			s.dragV = s.dragV * 0.5 + ((dx * 1.4) / frames) * 0.5;
		};
		const end = (e, isClick) => {
			if (!s.dragging) return;
			s.dragging = false;
			setDragging(false);
			if (isClick && s.moved < 4) return toggle(); // a tap or click, not a drag
			const stale = e.timeStamp - s.lastT > 90; // held still before letting go
			s.vel = stale ? 0 : clamp(s.dragV, -60, 60);
			if (Math.abs(s.vel) > 0.5) s.dir = s.vel > 0 ? 1 : -1;
			wake();
		};
		const up = (e) => end(e, true);
		const cancel = (e) => end(e, false);

		/* keyboard */
		const key = (e) => {
			if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				toggle();
			} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				s.dir = e.key === "ArrowRight" ? 1 : -1;
				s.vel = s.dir * 14;
				wake();
			}
		};

		wrap.addEventListener("pointerenter", enter);
		wrap.addEventListener("pointerleave", leave);
		wrap.addEventListener("pointerdown", down);
		wrap.addEventListener("pointermove", move);
		wrap.addEventListener("pointerup", up);
		wrap.addEventListener("pointercancel", cancel);
		wrap.addEventListener("lostpointercapture", cancel);
		wrap.addEventListener("keydown", key);

		return () => {
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			io.disconnect();
			wrap.removeEventListener("pointerenter", enter);
			wrap.removeEventListener("pointerleave", leave);
			wrap.removeEventListener("pointerdown", down);
			wrap.removeEventListener("pointermove", move);
			wrap.removeEventListener("pointerup", up);
			wrap.removeEventListener("pointercancel", cancel);
			wrap.removeEventListener("lostpointercapture", cancel);
			wrap.removeEventListener("keydown", key);
		};
	}, [spacing, speed, curve, vbW]);

	const d = `M-100,40 Q${vbW / 2},${40 + curve} ${vbW + 100},40`;
	const fade =
		"linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)";

	return (
		<div
			ref={wrapRef}
			role="button"
			tabIndex={0}
			aria-pressed={paused}
			aria-label={`${spoken}. Scrolling text. Press to pause.`}
			className={`select-none overflow-hidden focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-rose/60 ${
				dragging ? "cursor-grabbing" : "cursor-grab"
			} ${className}`}
			style={{ touchAction: "pan-y", WebkitMaskImage: fade, maskImage: fade }}
		>
			<svg
				viewBox={`0 0 ${vbW} 170`}
				className="block w-full overflow-visible"
				aria-hidden="true"
			>
				<text
					ref={measureRef}
					xmlSpace="preserve"
					className="curved-text"
					style={{ visibility: "hidden", opacity: 0 }}
				>
					{renderRun("m")}
				</text>
				<defs>
					<path ref={pathRef} id={pathId} d={d} fill="none" />
				</defs>
				{spacing > 0 && (
					<text xmlSpace="preserve" className="curved-text">
						<textPath
							ref={textPathRef}
							href={`#${pathId}`}
							startOffset={`${-spacing}px`}
						>
							{Array.from({ length: repeat }, (_, i) => renderRun(i))}
						</textPath>
					</text>
				)}
			</svg>
		</div>
	);
}
