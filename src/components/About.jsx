import { useEffect, useState } from "react";
import { reduced, useInView } from "./Fx";

const GRADE = 8.55;
const GRADE_LINES = [
	"CGPA out of 10",
	"Galgotias University",
	"CS Undergraduate",
];

const css = `
@keyframes ab-tip{0%{transform:rotate(0)}22%{transform:rotate(-2deg)}48%{transform:rotate(11deg)}68%{transform:rotate(-3deg)}84%{transform:rotate(1.2deg)}100%{transform:rotate(0)}}
@keyframes ab-roll{from{opacity:0;transform:translateY(.5em)}}
@keyframes ab-blink{50%{opacity:0}}
.ab-tip{animation:ab-tip 1000ms cubic-bezier(.36,.07,.19,.97) both}
.ab-roll{animation:ab-roll 380ms cubic-bezier(.2,.8,.2,1) both}
.ab-caret{animation:ab-blink 1.15s steps(1) infinite}
@media (prefers-reduced-motion:reduce){
.ab-tip,.ab-roll,.ab-caret{animation:none}
.ab-draw{stroke-dashoffset:0!important;transition:none!important}
}
`;

// Sentences light up as you read down the page.
function Lit({ children }) {
	const [ref, lit] = useInView(0, true, "0px 0px -20% 0px");
	return (
		<span
			ref={ref}
			className={`transition-opacity duration-[900ms] motion-reduce:opacity-100 ${lit ? "opacity-100" : "opacity-30"}`}
		>
			{children}
		</span>
	);
}

// The grade counts up when it arrives. Click for a footnote.
function Grade() {
	const [ref, inView] = useInView(0.6);
	const [val, setVal] = useState(reduced() ? GRADE : 0);
	const [line, setLine] = useState(0);

	useEffect(() => {
		if (!inView) return;
		if (reduced()) {
			setVal(GRADE);
			return;
		}
		let raf;
		const t0 = performance.now();
		const step = (t) => {
			const p = Math.min(1, (t - t0) / 1300);
			setVal(GRADE * (1 - Math.pow(1 - p, 3)));
			if (p < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [inView]);

	return (
		<button
			ref={ref}
			type="button"
			onClick={() => setLine((l) => (l + 1) % GRADE_LINES.length)}
			className="reveal mx-auto block w-fit -rotate-[2.5deg] cursor-pointer rounded-2xl border-2 border-dashed border-rose/40 bg-ink px-8 py-6 text-center transition-[rotate,scale] duration-500 hover:rotate-0 active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-rose/60 lg:mx-0"
			style={{ "--delay": "160ms" }}
		>
			<span className="block text-sm text-mist">grade, for the record</span>
			<span
				aria-hidden="true"
				className="font-display mt-1 block text-5xl font-light tabular-nums text-rose"
			>
				{val.toFixed(2)}
			</span>
			<span className="sr-only">{GRADE}</span>
			<span aria-live="polite" className="mt-1 block text-sm text-dim">
				<span key={line} className="ab-roll inline-block">
					{GRADE_LINES[line]}
				</span>
			</span>
		</button>
	);
}

export default function About() {
	const [headRef, headIn] = useInView(0.6);
	const [tip, setTip] = useState(false);

	// The punchline: it nearly falls over, then doesn't. Once on arrival, again on hover.
	useEffect(() => {
		if (!headIn || reduced()) return;
		const t = setTimeout(() => setTip(true), 1100);
		return () => clearTimeout(t);
	}, [headIn]);

	return (
		<section id="about" className="relative overflow-hidden bg-ink-2">
			<style>{css}</style>
			<div className="mx-auto grid max-w-6xl gap-16 px-5 py-28 sm:px-8 sm:py-36 lg:grid-cols-12 lg:gap-10">
				<div className="lg:col-span-7">
					<h2
						ref={headRef}
						className="reveal font-display text-[clamp(2.1rem,4.2vw,3.4rem)] font-light leading-[1.12] tracking-[-0.02em]"
					>
						I like it when buttons look pretty. I like it even more when they{" "}
						<span
							onPointerEnter={() => !reduced() && setTip(true)}
							onAnimationEnd={() => setTip(false)}
							className={`relative inline-block origin-bottom whitespace-nowrap ${tip ? "ab-tip" : ""}`}
						>
							don't fall over
							<svg
								aria-hidden="true"
								viewBox="0 0 120 8"
								preserveAspectRatio="none"
								className="absolute -bottom-1 left-0 h-2 w-full text-rose"
							>
								<path
									className="ab-draw"
									d="M2 5 Q 15 0, 30 5 T 60 5 T 90 5 T 118 5"
									pathLength="1"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									style={{
										strokeDasharray: 1,
										strokeDashoffset: headIn ? 0 : 1,
										transition:
											"stroke-dashoffset 1100ms cubic-bezier(.65,0,.35,1) 400ms",
									}}
								/>
							</svg>
						</span>{" "}
						once real people start clicking.
					</h2>
					<div
						className="reveal mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-mist"
						style={{ "--delay": "120ms" }}
					>
						<p>
							<Lit>
								I got into software engineering because turning raw logic into working,
								interactive applications felt empowering.
							</Lit>{" "}
							<Lit>
								What started with mastering core Data Structures and Algorithms grew into
								building complete full-stack web applications from the ground up.
							</Lit>
						</p>
						<p>
							<Lit>
								With 480+ DSA problems solved and hands-on experience in Java and JavaScript,
								I care deeply about both sides of the coin:
							</Lit>{" "}
							<Lit>
								creating intuitive, responsive user experiences, and architecting reliable,
								well-structured backends backed by MySQL and MongoDB.
							</Lit>{" "}
							<Lit>
								Whether it's building the Avant AI Fashion Platform or optimizing database
								CRUD workflows, I focus on software that solves real problems cleanly.
							</Lit>
						</p>
					</div>
				</div>

				<div className="space-y-10 lg:col-span-4 lg:col-start-9 lg:pt-3">
					<Grade />

					<div className="reveal" style={{ "--delay": "220ms" }}>
						<h3 className="text-sm font-medium text-paper">Education</h3>
						<p className="font-display mt-3 text-2xl">Galgotias University</p>
						<p className="mt-1 text-mist">
							B.Tech. in Computer Science
						</p>
						<p className="mt-1 text-sm text-dim">October 2023 – June 2027</p>
						<div className="mt-4 border-t border-line/60 pt-3 text-sm text-mist/90">
							<p className="text-xs uppercase tracking-wider text-dim">Schooling</p>
							<p className="mt-1">Dr. Virendra Swarup Education Centre</p>
							<p className="text-xs text-dim">Senior Secondary (73.4%) · Secondary (62%)</p>
						</div>
					</div>

					<div className="reveal" style={{ "--delay": "280ms" }}>
						<h3 className="text-sm font-medium text-paper">Right now</h3>
						<p className="mt-3 leading-relaxed text-mist">
							Pursuing my CS degree at Galgotias University, continuing to solve algorithmic problems, and actively looking for full-stack and software engineering opportunities.
							<span
								aria-hidden="true"
								className="ab-caret ml-1.5 inline-block h-[1em] w-[0.45em] translate-y-[0.15em] bg-rose/80"
							/>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
