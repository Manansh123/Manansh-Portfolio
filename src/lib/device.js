// Device hints shared by the visual effects, read once at startup.
const mq = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const reduceMotion = mq("(prefers-reduced-motion: reduce)");
export const finePointer = mq("(hover: hover) and (pointer: fine)");

// Phones and low-core machines get cheaper WebGL: fewer pixels, 30fps.
export const lowPower =
	!finePointer ||
	(typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) <= 4);

export const frameInterval = lowPower ? 1000 / 30 : 0;
