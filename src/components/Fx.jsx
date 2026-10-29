import { useEffect, useRef, useState } from "react";

/* Tiny shared motion kit for Hero + About. No dependencies. */

const mq =
	typeof window !== "undefined" && window.matchMedia
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

export const reduced = () => !!mq?.matches;

// Pointer-driven effects: real mice only, never touch/pen, never reduced motion.
export const canMove = (e) => e.pointerType === "mouse" && !mq?.matches;

// A rose hairline that draws in from the left and wipes out to the right.
export const draw =
	"relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-rose after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100";
export const ring =
	"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-rose/60";

export function useInView(threshold = 0.6, once = true, rootMargin = "0px") {
	const ref = useRef(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (!("IntersectionObserver" in window)) {
			setInView(true);
			return;
		}
		const io = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setInView(true);
					if (once) io.disconnect();
				} else if (!once) {
					setInView(false);
				}
			},
			{ threshold, rootMargin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [threshold, once, rootMargin]);
	return [ref, inView];
}

// Layered depth: children with data-depth drift a few px against the pointer.
// Eased in a rAF loop that goes back to sleep once things settle.
export function useParallax(ref) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const layers = [...el.querySelectorAll("[data-depth]")];
		const s = { tx: 0, ty: 0, x: 0, y: 0, raf: 0 };

		const tick = () => {
			s.x += (s.tx - s.x) * 0.08;
			s.y += (s.ty - s.y) * 0.08;
			for (const l of layers) {
				const d = Number(l.dataset.depth);
				l.style.transform = `translate3d(${(s.x * d).toFixed(2)}px, ${(s.y * d * 0.6).toFixed(2)}px, 0)`;
			}
			const settled =
				Math.abs(s.tx - s.x) < 0.002 && Math.abs(s.ty - s.y) < 0.002;
			s.raf = settled ? 0 : requestAnimationFrame(tick);
		};
		const kick = () => {
			if (!s.raf) s.raf = requestAnimationFrame(tick);
		};
		const move = (e) => {
			if (!canMove(e)) return;
			const r = el.getBoundingClientRect();
			s.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
			s.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
			kick();
		};
		const leave = () => {
			s.tx = 0;
			s.ty = 0;
			kick();
		};

		el.addEventListener("pointermove", move, { passive: true });
		el.addEventListener("pointerleave", leave);
		return () => {
			cancelAnimationFrame(s.raf);
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerleave", leave);
		};
	}, [ref]);
}

// A soft magnetic field around its child: it leans toward the cursor and
// settles back with a little overshoot.
export function Magnetic({ children, pull = 0.28 }) {
	const inner = useRef(null);
	const move = (e) => {
		if (!canMove(e) || !inner.current) return;
		const r = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - (r.left + r.width / 2)) * pull;
		const y = (e.clientY - (r.top + r.height / 2)) * pull;
		const s = inner.current.style;
		s.transition = "transform 140ms ease-out";
		s.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
	};
	const leave = () => {
		const s = inner.current?.style;
		if (!s) return;
		s.transition = "transform 650ms cubic-bezier(.34,1.56,.64,1)";
		s.transform = "";
	};
	return (
		<span
			onPointerMove={move}
			onPointerLeave={leave}
			className="-m-3 inline-flex p-3"
		>
			<span ref={inner} className="inline-flex">
				{children}
			</span>
		</span>
	);
}
