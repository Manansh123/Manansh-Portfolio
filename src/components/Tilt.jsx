import { useRef } from "react";
import { finePointer, reduceMotion } from "../lib/device";

// React Bits' TiltedCard, without the spring library: the card leans toward
// the cursor and a soft glare follows it. Touch screens get a flat card.
export default function Tilt({ children, className = "", max = 6 }) {
	const ref = useRef(null);
	const enabled = finePointer && !reduceMotion;

	const onMove = (e) => {
		const el = ref.current;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
		el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
		el.style.setProperty("--gx", `${px * 100}%`);
		el.style.setProperty("--gy", `${py * 100}%`);
		el.dataset.active = "true";
	};
	const onLeave = () => {
		const el = ref.current;
		el.style.setProperty("--rx", "0deg");
		el.style.setProperty("--ry", "0deg");
		el.dataset.active = "false";
	};

	return (
		<div style={{ perspective: 1200 }} className={className}>
			<div
				ref={ref}
				onPointerMove={enabled ? onMove : undefined}
				onPointerLeave={enabled ? onLeave : undefined}
				className="tilt relative"
			>
				{children}
				<span aria-hidden="true" className="tilt-glare" />
			</div>
		</div>
	);
}
