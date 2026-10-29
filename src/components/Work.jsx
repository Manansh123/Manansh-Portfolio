import { useRef, useState } from "react";
import { projects } from "../data";
import { ArrowUpRight, Sparkle } from "./Icons";
import Tilt from "./Tilt";
import { Magnetic, canMove, useInView } from "./Fx";

const css = `
@keyframes wk-load{0%{transform:scaleX(0);opacity:1}55%{transform:scaleX(.85);opacity:1}80%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes wk-resolve{from{opacity:.15}45%{opacity:1;color:var(--color-rose,#A9515A)}}
@keyframes wk-done{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.wk-load{animation:wk-load 1100ms cubic-bezier(.3,.7,.3,1) both}
.wk-tok{animation:wk-resolve 700ms ease-out both;animation-delay:calc(var(--i) * 70ms)}
.wk-done{animation:wk-done 400ms ease-out both;animation-delay:calc(var(--n) * 70ms + 650ms)}
@media (prefers-reduced-motion:reduce){.wk-load{display:none}.wk-tok,.wk-done{animation:none}}
`;

// Edit these freely: they're the jokes.
const LIVE_LABELS = ["Visit", "Go on", "Poke it", "It's live"];
const SRC_LABELS = ["Source", "Snoop", "Read me", "No judging"];
const QUIPS = [
	"0 regrets",
	"0 vulnerabilities (I checked once)",
	"1 of which I'd rather not discuss",
	"peer deps mostly at peace",
];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function Links({ project }) {
	const hasLinks = project.live || project.source;
	return (
		<div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
			{project.live && (
				<Magnetic>
					<a
						href={project.live}
						target="_blank"
						rel="noreferrer"
						className="link-line group inline-flex items-center gap-1.5 text-paper"
					>
						Live Demo
						<span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
							<ArrowUpRight />
						</span>
					</a>
				</Magnetic>
			)}
			{project.source && (
				<Magnetic>
					<a
						href={project.source}
						target="_blank"
						rel="noreferrer"
						className="link-line group inline-flex items-center gap-1.5 text-mist hover:text-paper"
					>
						Source Code
						<span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
							<ArrowUpRight />
						</span>
					</a>
				</Magnetic>
			)}
			{!hasLinks && (
				<span className="font-mono text-xs text-dim">
					{project.noLinkNote || "Code & configuration available in repository"}
				</span>
			)}
		</div>
	);
}

// Loads like a page: a thin progress line runs across the top and the
// screenshot fades in from grey. A small label trails the cursor and gets a
// new line every time you re-enter. A rubber stamp slams down on hover.
function Shot({ project, aspect }) {
	const contain = project.fit === "contain";
	const hasLink = project.live || project.source;
	const [ref, loaded] = useInView(0.35);
	const labelRef = useRef(null);
	const [label, setLabel] = useState(project.live ? "Visit" : "Source");

	const enter = (e) => {
		if (canMove(e)) setLabel(pick(project.live ? LIVE_LABELS : SRC_LABELS));
	};
	const move = (e) => {
		if (!canMove(e) || !labelRef.current) return;
		const r = e.currentTarget.getBoundingClientRect();
		const s = labelRef.current.style;
		s.transform = `translate3d(${(e.clientX - r.left + 14).toFixed(0)}px, ${(e.clientY - r.top + 14).toFixed(0)}px, 0)`;
		s.opacity = 1;
		s.scale = "1";
	};
	const leave = () => {
		const s = labelRef.current?.style;
		if (!s) return;
		s.opacity = 0;
		s.scale = ".6";
	};

	const sharedClassName = `group relative block overflow-hidden rounded-2xl ring-1 ring-white/10 ${contain ? "bg-black" : "bg-ink-3"}`;
	const sharedContent = (
		<>
			<span
				aria-hidden="true"
				className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-rose ${loaded ? "wk-load" : "scale-x-0"}`}
			/>
			<picture>
				{project.poster && (
					<source
						media="(prefers-reduced-motion: reduce)"
						srcSet={project.poster}
					/>
				)}
				<img
					src={project.image}
					alt=""
					width={project.width}
					height={project.height}
					loading="lazy"
					decoding="async"
					className={`${aspect} w-full transition-[scale,filter] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:brightness-100 motion-reduce:saturate-100 ${loaded ? "" : "brightness-75 saturate-0"} ${contain ? "object-contain p-6" : "object-cover object-top"}`}
				/>
			</picture>

			{/* Rubber stamp: slams in on hover (always visible on touch screens) */}
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-3 left-3 z-10 -rotate-12 scale-150 rounded-md border-2 border-rose/80 bg-black/55 px-2.5 py-1 font-mono text-[12px] text-rose opacity-0 backdrop-blur-sm transition-[opacity,scale,rotate] duration-200 ease-[cubic-bezier(.3,1.6,.5,1)] group-hover:-rotate-6 group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:-rotate-6 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
			>
				{project.live ? "works on yours too" : "works on my machine"}
			</span>

			{hasLink && (
				<span
					ref={labelRef}
					className="pointer-events-none absolute left-0 top-0 z-10 grid h-11 place-items-center whitespace-nowrap rounded-full bg-paper px-4 text-[13px] font-medium text-ink opacity-0 transition-[opacity,scale,transform] duration-150 ease-out [scale:.6]"
				>
					{label}
				</span>
			)}
		</>
	);

	if (!hasLink) {
		return (
			<div ref={ref} className={sharedClassName}>
				{sharedContent}
			</div>
		);
	}

	return (
		<a
			ref={ref}
			href={hasLink}
			target="_blank"
			rel="noreferrer"
			tabIndex={-1}
			aria-hidden="true"
			onPointerEnter={enter}
			onPointerMove={move}
			onPointerLeave={leave}
			className={sharedClassName}
		>
			{sharedContent}
		</a>
	);
}

// Reads like a dependency install: packages resolve left to right,
// then npm files its report.
function Stack({ items }) {
	const [ref, on] = useInView(0.6);
	const quip = QUIPS[items.join("").length % QUIPS.length];
	return (
		<div ref={ref} className="mt-6 font-mono text-[13px] text-dim">
			<p className="flex flex-wrap gap-x-2">
				<span aria-hidden="true" className="text-dim/50">
					$ npm i
				</span>
				{items.map((s, i) => (
					<span key={s} className="inline-flex gap-2">
						<span
							className={`transition-colors duration-200 hover:text-rose motion-reduce:opacity-100 ${on ? "wk-tok" : "opacity-15"}`}
							style={{ "--i": i }}
						>
							{s}
						</span>
						{i < items.length - 1 && (
							<span aria-hidden="true" className="text-dim/40">
								/
							</span>
						)}
					</span>
				))}
			</p>
			<p
				aria-hidden="true"
				className={`mt-1.5 text-[12px] text-dim/70 motion-reduce:opacity-100 ${on ? "wk-done" : "opacity-0"}`}
				style={{ "--n": items.length }}
			>
				added {items.length} {items.length === 1 ? "package" : "packages"},{" "}
				{quip}
			</p>
		</div>
	);
}

// Bullets tick in one at a time as you read down.
function Point({ text }) {
	const [ref, lit] = useInView(0, true, "0px 0px -15% 0px");
	return (
		<li
			ref={ref}
			className={`flex gap-3.5 transition-opacity duration-700 motion-reduce:opacity-100 ${lit ? "opacity-100" : "opacity-25"}`}
		>
			<Sparkle
				className={`mt-[0.45em] h-2.5 w-2.5 shrink-0 text-rose transition-transform duration-700 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:rotate-0 motion-reduce:scale-100 ${lit ? "rotate-0 scale-100" : "-rotate-90 scale-50"
					}`}
			/>
			<span>{text}</span>
		</li>
	);
}

function Featured({ project, flip }) {
	const isPrimary = project.featured;
	return (
		<article
			className={`relative rounded-3xl p-6 transition-all duration-300 sm:p-9 ${isPrimary
					? "border border-rose/30 bg-ink-2/70 shadow-[0_24px_64px_-24px_rgba(123,53,60,0.18)] ring-1 ring-rose/20"
					: "border border-white/10 bg-ink-2/40 hover:border-white/20"
				}`}
		>
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-mono uppercase tracking-wider ${isPrimary
							? "border border-rose/50 bg-rose/10 text-rose"
							: "border border-white/15 bg-white/5 text-mist"
						}`}
				>
					<Sparkle className="h-2.5 w-2.5" />
					{project.badge || (isPrimary ? "Primary Featured Project" : "Application")}
				</span>
			</div>
			<div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
				<div className={`reveal lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
					<Tilt>
						<Shot project={project} aspect="aspect-[16/10]" />
					</Tilt>
				</div>
				<div
					className={`reveal lg:col-span-5 ${flip ? "lg:order-1" : ""}`}
					style={{ "--delay": "120ms" }}
				>
					<h3 className="font-display text-4xl font-normal tracking-tight sm:text-5xl">
						{project.title}
					</h3>
					<p className="mt-4 text-lg leading-relaxed text-mist">
						{project.summary}
					</p>
					<ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-mist/90">
						{project.points.map((p) => (
							<Point key={p} text={p} />
						))}
					</ul>
					<Stack items={project.stack} />
					<Links project={project} />
				</div>
			</div>
		</article>
	);
}

function Small({ project, delay }) {
	return (
		<article className="reveal" style={{ "--delay": delay }}>
			<Tilt>
				<Shot project={project} aspect="aspect-[4/3]" />
			</Tilt>
			<h3 className="font-display mt-7 text-3xl font-normal tracking-tight sm:text-4xl">
				{project.title}
			</h3>
			<p className="mt-3 max-w-md leading-relaxed text-mist">
				{project.summary}
			</p>
			<Stack items={project.stack} />
			<Links project={project} />
		</article>
	);
}

// first commit ---------- real users, drawn once as the header arrives.
// A dot rides the line like a commit shipping, with a nod to the messy middle.
function Journey() {
	const [ref, on] = useInView(0.8);
	return (
		<div
			ref={ref}
			aria-hidden="true"
			className="mt-8 flex max-w-md items-center gap-3 text-sm text-dim"
		>
			<span>first commit</span>
			<span className="relative h-px flex-1">
				<span
					className={`absolute inset-0 origin-left bg-line transition-transform duration-[1400ms] ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:scale-x-100 motion-reduce:transition-none ${on ? "scale-x-100" : "scale-x-0"
						}`}
				/>
				<span
					className={`absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-rose shadow-[0_0_10px_var(--color-rose,#A9515A)] transition-[left,opacity] duration-[1400ms] ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:hidden ${on ? "left-[calc(100%-6px)]" : "left-0"
						}`}
				/>
				<span
					className={`absolute left-1/2 top-2.5 -translate-x-1/2 whitespace-nowrap text-[12px] text-dim/70 transition-opacity duration-500 motion-reduce:opacity-100 ${on ? "opacity-100 delay-700" : "opacity-0"
						}`}
				>
					lots of "fix typo" commits
				</span>
			</span>
			<span
				className={`transition-colors duration-500 motion-reduce:text-rose motion-reduce:delay-0 ${on ? "text-rose delay-[1400ms]" : ""
					}`}
			>
				real users
			</span>
		</div>
	);
}

// A todo item you can actually tick. Ticking it is the call to action.
function NextUp() {
	const [done, setDone] = useState(false);
	return (
		<div className="reveal mx-auto mt-24 max-w-md sm:mt-32">
			<button
				type="button"
				role="checkbox"
				aria-checked={done}
				onClick={() => setDone((v) => !v)}
				className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left outline-none transition-colors hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/60"
			>
				<span
					aria-hidden="true"
					className={`grid size-6 shrink-0 place-items-center rounded-md border transition-colors duration-300 ${done
							? "border-rose bg-rose text-ink"
							: "border-white/25 group-hover:border-white/50"
						}`}
				>
					<svg viewBox="0 0 16 16" className="size-3.5">
						<path
							d="M3 8.5l3.2 3.2L13 4.8"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							pathLength="1"
							strokeDasharray="1"
							strokeDashoffset={done ? 0 : 1}
							className="transition-[stroke-dashoffset] delay-100 duration-300 motion-reduce:transition-none"
						/>
					</svg>
				</span>
				<span
					className={`relative font-display text-2xl font-light tracking-tight transition-colors duration-500 ${done ? "text-dim" : "text-paper"
						}`}
				>
					Build something with you
					<span
						aria-hidden="true"
						className="absolute left-0 top-1/2 h-px bg-rose transition-[width] duration-500 ease-out motion-reduce:transition-none"
						style={{ width: done ? "100%" : 0 }}
					/>
				</span>
			</button>

			<div
				className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${done ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
					}`}
			>
				<div className="overflow-hidden">
					<p className="pt-4 text-[15px] text-mist">
						Marked as done. Well, started.{" "}
						<a
							href="#contact"
							tabIndex={done ? 0 : -1}
							className="link-line inline-flex items-center gap-1.5 text-paper"
						>
							Say hi
							<ArrowUpRight />
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

export default function Work() {
	const featured = projects.filter((p) => p.points);
	const rest = projects.filter((p) => !p.points);

	return (
		<section
			id="work"
			className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36"
		>
			<style>{css}</style>
			<div className="reveal mb-16 max-w-2xl sm:mb-20">
				<h2 className="font-display text-5xl font-light tracking-tight sm:text-6xl">
					Things I've built
				</h2>
				<p className="mt-5 text-lg text-mist">
					Full-stack and backend applications engineered from the ground up, combining modern interfaces with structured data.
				</p>
				<Journey />
			</div>

			<div className="space-y-16 sm:space-y-24">
				{featured.map((p, i) => (
					<Featured key={p.id} project={p} flip={i % 2 === 1} />
				))}
				{rest.length > 0 && (
					<div className="grid gap-16 md:grid-cols-2 md:gap-10">
						{rest.map((p, i) => (
							<Small key={p.id} project={p} delay={`${i * 120}ms`} />
						))}
					</div>
				)}
			</div>

			<NextUp />
		</section>
	);
}
