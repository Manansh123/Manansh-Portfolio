import { useEffect, useRef } from "react";
import { reduceMotion } from "../lib/device";

// React Bits' CountUp: counts to `to` the first time it scrolls into view.
export default function CountUp({ to, duration = 1600, className = "" }) {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (reduceMotion) {
			el.textContent = to.toLocaleString("en-IN");
			return;
		}
		let raf = 0;
		const io = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			io.disconnect();
			const start = performance.now();
			const tick = (now) => {
				const t = Math.min((now - start) / duration, 1);
				const eased = 1 - Math.pow(1 - t, 4);
				el.textContent = Math.round(to * eased).toLocaleString("en-IN");
				if (t < 1) raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		});
		io.observe(el);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	}, [to, duration]);

	return (
		<span ref={ref} className={`tabular-nums ${className}`}>
			0
		</span>
	);
}
