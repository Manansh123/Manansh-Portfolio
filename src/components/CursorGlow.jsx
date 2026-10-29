import { useEffect, useRef } from "react";
import { finePointer, reduceMotion } from "../lib/device";

// A faint rose light trailing the cursor. Desktop only, idle when still.
export default function CursorGlow() {
	const ref = useRef(null);

	useEffect(() => {
		if (!finePointer || reduceMotion) return;
		const el = ref.current;
		let x = -500, y = -500, tx = -500, ty = -500, raf = 0;
		const step = () => {
			x += (tx - x) * 0.15;
			y += (ty - y) * 0.15;
			el.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
			raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0;
		};
		const onMove = (e) => {
			tx = e.clientX;
			ty = e.clientY;
			el.style.opacity = "1";
			if (!raf) raf = requestAnimationFrame(step);
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => {
			window.removeEventListener("pointermove", onMove);
			cancelAnimationFrame(raf);
		};
	}, []);

	if (!finePointer) return null;
	return (
		<div
			ref={ref}
			aria-hidden="true"
			className="pointer-events-none fixed left-0 top-0 z-30 h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-700"
			style={{
				background: "radial-gradient(circle, rgb(123 53 60 / 0.10) 0%, transparent 65%)",
				willChange: "transform",
			}}
		/>
	);
}
