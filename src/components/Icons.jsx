export const ArrowUpRight = ({ className = "h-3.5 w-3.5" }) => (
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
		<path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const ArrowDown = ({ className = "h-3.5 w-3.5" }) => (
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
		<path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const GitHub = ({ className = "h-4 w-4" }) => (
	<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
		<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
	</svg>
);

export const LinkedIn = ({ className = "h-4 w-4" }) => (
	<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
		<path d="M0 1.15C0 .52.52 0 1.18 0h13.64C15.48 0 16 .52 16 1.15v13.7c0 .63-.52 1.15-1.18 1.15H1.18C.52 16 0 15.48 0 14.85V1.15Zm4.94 12.24V6.17H2.542v7.22h2.4Zm-1.2-8.21c.84 0 1.36-.55 1.36-1.25-.02-.71-.52-1.25-1.34-1.25-.82 0-1.36.54-1.36 1.25 0 .7.52 1.25 1.33 1.25h.01Zm4.91 8.21V9.36c0-.22.02-.43.08-.59.17-.43.57-.88 1.23-.88.87 0 1.21.66 1.21 1.63v3.87h2.4V9.25c0-2.22-1.18-3.25-2.76-3.25-1.28 0-1.85.7-2.17 1.19v.03h-.02l.02-.03V6.17h-2.4c.03.68 0 7.22 0 7.22h2.4Z" />
	</svg>
);

export const LeetCode = ({ className = "h-4 w-4" }) => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
		<path d="M13.48 0a1.37 1.37 0 0 0-.96.44L7.12 6.2l-2.8 3a5.3 5.3 0 0 0-1.27 2.12 5.83 5.83 0 0 0-.23 1.24 5.36 5.36 0 0 0 .15 1.77c.16.64.44 1.25.84 1.8.2.28.43.55.68.8l4.35 4.39c1.93 1.95 5.1 1.97 7.07.04l2.62-2.57a1.38 1.38 0 0 0-1.93-1.97l-2.62 2.57a2.2 2.2 0 0 1-3.13-.02l-4.34-4.39a2.24 2.24 0 0 1-.14-.16 2.47 2.47 0 0 1-.37-.83 2.6 2.6 0 0 1 .06-1.44 2.5 2.5 0 0 1 .55-.93l2.74-2.94 5.43-5.8A1.38 1.38 0 0 0 13.48 0Zm-2.87 12.25a1.38 1.38 0 1 0 0 2.76h9.95a1.38 1.38 0 1 0 0-2.76h-9.95Z" />
	</svg>
);

export const Codolio = ({ className = "h-4 w-4" }) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		className={className}
	>
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
		<line x1="14" y1="4" x2="10" y2="20" stroke="currentColor" strokeWidth="2" />
	</svg>
);

// Clean minimal uppercase M monogram — medium weight, geometric, premium
export const Mark = ({ className = "h-8 w-8" }) => (
	<svg
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		className={className}
	>
		{/* Geometric M: two vertical stems with a clean V-notch, medium stroke weight */}
		<path
			d="M4 26V7L16 19L28 7V26"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
	</svg>
);

export const Sparkle = ({ className = "" }) => (
	<svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
		<path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" />
	</svg>
);
