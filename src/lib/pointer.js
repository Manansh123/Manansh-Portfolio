import { finePointer } from "./device";

// SpotlightCard: feed the cursor position to CSS. Touch screens skip it.
export function spotlight(e) {
	if (!finePointer) return;
	const el = e.currentTarget;
	const r = el.getBoundingClientRect();
	el.style.setProperty("--x", `${e.clientX - r.left}px`);
	el.style.setProperty("--y", `${e.clientY - r.top}px`);
}
