export const hexToRgb = (hex) => {
	const n = parseInt(hex.replace("#", ""), 16);
	return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
