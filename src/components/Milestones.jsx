import { useEffect, useRef, useState } from "react";
import CountUp from "./CountUp";
import { ArrowUpRight } from "./Icons";
import { certifications, milestones } from "../data";
import { spotlight } from "../lib/pointer";
import { Magnetic, reduced, ring, useInView } from "./Fx";

// Each card is a "submission". It runs when it scrolls in, then gets a verdict.
const VERDICTS = ["Accepted", "All cases passed", "Verified", "Shipped"];
const RUN_MS = 900;

const css = `
@keyframes ms-sweep{0%{transform:scaleX(0);opacity:1}70%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes ms-roll{from{opacity:0;transform:translateY(.5em)}}
.ms-sweep{animation:ms-sweep ${RUN_MS}ms cubic-bezier(.65,0,.35,1) both}
.ms-roll{animation:ms-roll 380ms cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){
.ms-sweep{display:none}
.ms-roll{animation:none}
.ms-check{transition:none!important}
}
`;

function Card({ m, i, onPass }) {
	const [ref, inView] = useInView(0.5);
	const [run, setRun] = useState(0); // bumps when the visitor re-runs it
	const [done, setDone] = useState(false);
	const counted = useRef(false);

	const pass = () => {
		setDone(true);
		if (!counted.current) {
			counted.current = true;
			onPass();
		}
	};

	useEffect(() => {
		if (!inView) return;
		if (reduced()) {
			pass();
			return;
		}
		setDone(false);
		const wait = run === 0 ? i * 200 : 0; // first run staggers across the row
		const t = setTimeout(pass, wait + RUN_MS);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inView, run]);

	const wait = run === 0 ? i * 200 : 0;

	return (
		<li
			ref={ref}
			onPointerMove={spotlight}
			className="spotlight reveal relative flex flex-col rounded-3xl border border-white/[0.08] bg-ink-2 p-7 transition-colors hover:border-rose/30 sm:p-8"
			style={{ "--delay": `${i * 90}ms` }}
		>
			{inView && (
				<span
					key={run}
					aria-hidden="true"
					className="ms-sweep pointer-events-none absolute inset-x-8 top-0 h-px origin-left bg-rose"
					style={{ animationDelay: `${wait}ms` }}
				/>
			)}

			<button
				type="button"
				onClick={() => setRun((r) => r + 1)}
				aria-live="polite"
				className={`group/v ${ring} mb-6 inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-dim transition-colors hover:text-paper`}
			>
				<svg
					viewBox="0 0 16 16"
					aria-hidden="true"
					className="h-3.5 w-3.5 text-rose"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path
						className="ms-check"
						d="M3 8.5l3.2 3.2L13 5"
						pathLength="1"
						style={{
							strokeDasharray: 1,
							strokeDashoffset: done ? 0 : 1,
							transition: "stroke-dashoffset 450ms ease-out",
						}}
					/>
				</svg>
				<span className="inline-grid">
					<span
						key={String(done)}
						className="ms-roll col-start-1 row-start-1 transition-opacity duration-200 group-hover/v:opacity-0 group-focus-visible/v:opacity-0"
					>
						{done ? VERDICTS[i % VERDICTS.length] : "Running…"}
					</span>
					<span
						aria-hidden="true"
						className="col-start-1 row-start-1 opacity-0 transition-opacity duration-200 group-hover/v:opacity-100 group-focus-visible/v:opacity-100"
					>
						Run again
					</span>
				</span>
			</button>

			<p className="text-[15px] text-mist">{m.title}</p>
			<p className="font-display mt-8 text-6xl font-light tracking-tight text-paper sm:text-7xl">
				{m.count ? (
					<CountUp key={run} to={m.count} />
				) : (
					<span key={run} className={run ? "ms-roll inline-block" : undefined}>
						{m.value}
					</span>
				)}
				{m.suffix && (
					<span className="ml-1 text-3xl text-rose sm:text-4xl">
						{m.suffix}
					</span>
				)}
			</p>
			<p className="mt-5 flex-1 leading-relaxed text-mist">{m.detail}</p>
			<div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5 text-sm text-dim">
				<span>{m.meta}</span>
				{m.href && (
					<Magnetic>
						<a
							href={m.href}
							target="_blank"
							rel="noreferrer"
							className="group inline-flex shrink-0 items-center gap-1 text-mist transition-colors hover:text-rose"
						>
							Profile
							<span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
								<ArrowUpRight />
							</span>
						</a>
					</Magnetic>
				)}
			</div>
		</li>
	);
}

export default function Milestones() {
	const [passed, setPassed] = useState(0);
	const total = milestones.length;
	const allGreen = passed === total;

	return (
		<section
			id="milestones"
			className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36"
		>
			<style>{css}</style>
			<div className="reveal mb-14 max-w-2xl">
				<h2 className="font-display text-5xl font-light tracking-tight sm:text-6xl">
					Problem solving &amp; milestones
				</h2>
				<p className="mt-5 text-lg text-mist">
					Contests, certifications, and high-volume algorithmic practice.
				</p>
				<p
					aria-live="polite"
					className="mt-4 min-h-5 text-sm tabular-nums text-dim"
				>
					<span
						className={`transition-colors duration-500 ${allGreen ? "text-rose" : ""}`}
					>
						{passed} / {total} passing
					</span>
					{allGreen && ". Verified and clean."}
				</p>
			</div>

			<ul className="grid gap-4 md:grid-cols-3">
				{milestones.map((m, i) => (
					<Card key={m.id} m={m} i={i} onPass={() => setPassed((p) => p + 1)} />
				))}
			</ul>

			{/* Certifications showcase */}
			<div className="reveal mt-14 border-t border-line pt-12 sm:mt-18 sm:pt-16">
				<div className="mb-8">
					<h3 className="font-display text-2xl font-light tracking-tight text-paper sm:text-3xl">
						Verified Certifications
					</h3>
					<p className="mt-1 text-sm text-mist">
						Technical credentials in database systems and international communication.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					{certifications.map((c) => (
						<div
							key={c.id}
							onPointerMove={spotlight}
							className="spotlight relative rounded-2xl border border-white/[0.08] bg-ink-2/80 p-6 transition-colors hover:border-rose/30"
						>
							<div className="flex items-center justify-between gap-4 text-xs font-mono text-dim">
								<span className="text-mist">{c.issuer}</span>
								<span className="rounded-full bg-white/5 px-2.5 py-0.5 text-dim">
									{c.year}
								</span>
							</div>
							<h4 className="mt-3 text-lg font-medium text-paper">
								{c.title}
							</h4>
							{c.score && (
								<p className="mt-1 font-mono text-sm text-rose">
									{c.score}
								</p>
							)}
							<p className="mt-2 text-sm leading-relaxed text-mist">
								{c.detail}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
