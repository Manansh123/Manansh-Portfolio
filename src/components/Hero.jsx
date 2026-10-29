import { useEffect, useRef, useState } from "react";
import Dither from "./Dither";
import { ArrowDown } from "./Icons";
import { profile } from "../data";
import { Magnetic, canMove, draw, ring, useParallax } from "./Fx";

const CAPTIONS = [
	"Software Engineering Student & Full Stack Developer",
	"480+ DSA problems solved & counting",
	"Yes, that's my actual face.",
	"Always open to interesting engineering challenges.",
];

// Edit these freely: they're the jokes.
const NOTES = [
	"480+ DSA problems solved",
	"clean OOP & data structures",
	"indexing & database schemas",
	"REST APIs & Node endpoints",
	"responsive React interfaces",
	"Java backend architecture",
];
const TZ = "Asia/Kolkata";
const IDLE_MS = 12000;

// Greets by the visitor's own local time.
const greet = (h) =>
	h < 5 || h >= 22
		? "Up late? Same."
		: h < 12
			? "Good morning."
			: h < 17
				? "Good afternoon."
				: "Good evening.";

// React Bits' BlurText: each word sharpens into place, one after another.
// A part may also carry pointer handlers (used for the margin note).
function BlurText({ parts, start = 120, step = 70 }) {
	let n = 0;
	return parts.map((part, pi) => (
		<span
			key={pi}
			className={part.className}
			onPointerEnter={part.onPointerEnter}
			onPointerMove={part.onPointerMove}
			onPointerLeave={part.onPointerLeave}
		>
			{part.text.split(" ").map((word, wi, arr) => {
				const d = start + n++ * step;
				return (
					<span key={wi}>
						<span className="blur-word" style={{ "--d": `${d}ms` }}>
							{word}
						</span>
						{(wi < arr.length - 1 || pi < parts.length - 1) && " "}
					</span>
				);
			})}
		</span>
	));
}

const css = `
@keyframes hero-focus{from{filter:blur(14px);transform:scale(1.08);opacity:.6}}
@keyframes hero-roll{from{opacity:0;transform:translateY(.5em)}}
.hero-focus{animation:hero-focus 1400ms cubic-bezier(.2,.8,.2,1) 250ms both}
.hero-roll{animation:hero-roll 380ms cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){.hero-focus,.hero-roll{animation:none}}
`;

export default function Hero() {
	const sceneRef = useRef(null);
	const h1Ref = useRef(null);
	const noteRef = useRef(null);
	const cardRef = useRef(null);
	const backTimer = useRef(0);
	const [ci, setCi] = useState(0);
	const [ni, setNi] = useState(0);
	const [inspect, setInspect] = useState(null); // null, or "380 × 475" while hovering the portrait
	const [idle, setIdle] = useState(false);
	// Client-only app assumed (Vite). If you ever server-render this, move the greeting into an effect.
	const [hello] = useState(() => greet(new Date().getHours()));

	useParallax(sceneRef);
	useEffect(() => () => clearTimeout(backTimer.current), []);

	/* still here? after a quiet spell at the top, the main button nudges */
	useEffect(() => {
		let t;
		const arm = () => {
			clearTimeout(t);
			setIdle(false);
			t = setTimeout(() => {
				if (window.scrollY < 100) setIdle(true);
			}, IDLE_MS);
		};
		arm();
		const events = ["scroll", "pointerdown", "keydown"];
		events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
		return () => {
			clearTimeout(t);
			events.forEach((ev) => window.removeEventListener(ev, arm));
		};
	}, []);

	/* margin note: a little annotation follows the cursor over "stuff underneath",
	   and it's a different one every time you come back */
	const note = {
		onPointerEnter: (e) => {
			if (!canMove(e)) return;
			let k;
			do k = Math.floor(Math.random() * NOTES.length);
			while (k === ni);
			setNi(k);
		},
		onPointerMove: (e) => {
			if (!canMove(e) || !noteRef.current || !h1Ref.current) return;
			const r = h1Ref.current.getBoundingClientRect();
			const s = noteRef.current.style;
			s.transform = `translate3d(${(e.clientX - r.left + 14).toFixed(0)}px, ${(e.clientY - r.top - 46).toFixed(0)}px, 0) rotate(-3deg)`;
			s.opacity = 1;
		},
		onPointerLeave: () => {
			if (noteRef.current) noteRef.current.style.opacity = 0;
		},
	};

	/* portrait tilt (+ "inspect element" overlay) */
	const enter = (e) => {
		if (!canMove(e) || !cardRef.current) return;
		setInspect(
			`${cardRef.current.offsetWidth} × ${cardRef.current.offsetHeight}`,
		);
	};
	const tilt = (e) => {
		if (!canMove(e) || !cardRef.current) return;
		const r = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width - 0.5;
		const y = (e.clientY - r.top) / r.height - 0.5;
		const s = cardRef.current.style;
		s.transition = "transform 120ms ease-out";
		s.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) scale(1.01)`;
	};
	const settle = () => {
		setInspect(null);
		const s = cardRef.current?.style;
		if (!s) return;
		s.transition = "transform 700ms cubic-bezier(.22,1,.36,1)";
		s.transform = "";
	};

	/* caption: click for a new line, it drifts back to the real message */
	const nextCaption = () => {
		setCi((i) => (i + 1) % CAPTIONS.length);
		clearTimeout(backTimer.current);
		backTimer.current = setTimeout(() => setCi(0), 6000);
	};

	return (
		<section
			ref={sceneRef}
			id="top"
			className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
		>
			<style>{css}</style>

			{/* far layer: the waves barely drift */}
			<div className="absolute -inset-6 -z-10" data-depth="-3">
				<Dither />
			</div>
			<div className="absolute inset-0 -z-10">
				{/* Keep the copy side calm and let the waves live on the right */}
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_11_14/0.5)_0%,rgb(11_11_14/0.78)_45%,rgb(11_11_14/0.35)_100%)] lg:bg-[linear-gradient(90deg,#0b0b0e_0%,rgb(11_11_14/0.86)_30%,rgb(11_11_14/0.12)_58%,rgb(11_11_14/0)_72%)]" />
				<div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
				<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink via-ink/75 to-transparent" />
			</div>

			<div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 pb-12 pt-32 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-28">
				{/* mid layer */}
				<div className="lg:col-span-7" data-depth="-6">
					<p className="reveal text-lg text-mist">{hello} I'm Manansh.</p>
					<h1
						ref={h1Ref}
						className="font-display relative mt-5 text-[clamp(2.7rem,6.2vw,5.4rem)] font-light leading-[1.04] tracking-[-0.025em]"
					>
						<BlurText
							parts={[
								{ text: "I build software that solves problems, and the" },
								{
									text: "systems underneath",
									className: "cursor-help font-normal italic text-rose",
									...note,
								},
								{ text: "them." },
							]}
						/>
						<span
							ref={noteRef}
							aria-hidden="true"
							className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap border-b border-rose/60 pb-0.5 text-lg font-normal italic tracking-normal text-paper opacity-0 transition-[opacity,transform] duration-150 ease-out [text-shadow:0_1px_12px_rgb(0_0_0/0.9)]"
						>
							{NOTES[ni]}
						</span>
					</h1>
					<p
						className="reveal mt-7 max-w-lg text-lg leading-relaxed text-mist"
						style={{ "--delay": "700ms" }}
					>
						Software Engineering student at Galgotias University with a strong foundation in Data Structures, Algorithms, and Full-Stack Development. Builder of the Avant AI Fashion Platform and intern at InAmigos Foundation &amp; AICTE Eduskills.
					</p>
					<div
						className="reveal mt-10 flex flex-wrap items-center gap-x-4 gap-y-3"
						style={{ "--delay": "820ms" }}
					>
						<Magnetic>
							<a
								href="#work"
								className="group inline-flex items-center gap-2.5 rounded-full bg-paper px-6 py-3 font-medium text-ink transition-[background-color,scale] duration-200 hover:bg-rose active:scale-[0.97]"
							>
								<span
									key={idle ? "idle" : "rest"}
									className="hero-roll inline-block"
								>
									{idle ? "Still here? See my work" : "See my work"}
								</span>
								<ArrowDown
									className={`h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-reduce:animate-none ${idle ? "animate-bounce" : ""
										}`}
								/>
							</a>
						</Magnetic>
						<Magnetic>
							<a
								href={profile.resume}
								download="Manansh_Gupta_Resume.pdf"
								target="_blank"
								rel="noreferrer"
								className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 font-medium text-paper transition-[background-color,border-color,scale] duration-200 hover:border-rose/60 hover:bg-rose/10 active:scale-[0.97]"
							>
								<span>Download Resume</span>
								<span className="inline-flex transition-transform duration-200 group-hover:translate-y-0.5">
									<ArrowDown className="h-3.5 w-3.5" />
								</span>
							</a>
						</Magnetic>
						<Magnetic>
							<a href="#contact" className="link-line text-paper">
								Get in touch
							</a>
						</Magnetic>
					</div>
				</div>

				{/* near layer: drifts the other way */}
				<div
					className="mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:col-span-5 lg:mr-0 lg:max-w-[380px]"
					data-depth="9"
				>
					<figure className="reveal" style={{ "--delay": "200ms" }}>
						<div
							onPointerEnter={enter}
							onPointerMove={tilt}
							onPointerLeave={settle}
						>
							<div
								ref={cardRef}
								className="relative"
							>
								<img
									src="/images/manansh-cutout.png"
									alt="Portrait of Manansh Gupta"
									width="1087"
									height="1447"
									fetchPriority="high"
									className="hero-focus w-full h-auto"
								/>

								{/* Hover the portrait and the browser's element inspector "selects" it */}
								<div
									aria-hidden="true"
									className={`pointer-events-none absolute inset-0 border-[10px] border-[#93c47d]/35 bg-[#6fa8dc]/20 transition-opacity duration-200 motion-reduce:transition-none ${inspect ? "opacity-100" : "opacity-0"
										}`}
								>
									<div className="absolute left-2.5 top-2.5 rounded-md bg-[#1e1f24]/95 px-2.5 py-1.5 font-mono text-[11px] leading-snug shadow-lg">
										<p>
											<span className="text-[#c47b82]">img</span>
											<span className="text-[#f0a05e]">.manansh</span>{" "}
											<span className="text-white/60">{inspect}</span>
										</p>
										<p className="text-white/45">role: software engineer</p>
									</div>
								</div>
							</div>
						</div>
						<figcaption
							aria-live="polite"
							className="mt-4 flex justify-center text-sm text-mist lg:justify-end"
						>
							<button
								type="button"
								onClick={nextCaption}
								className={`${draw} ${ring} cursor-pointer transition-colors hover:text-paper`}
							>
								<span key={ci} className="hero-roll inline-block">
									{CAPTIONS[ci]}
								</span>
							</button>
						</figcaption>
					</figure>
				</div>
			</div>

			<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 pb-8 text-sm text-dim sm:px-8">
				<span>{profile.location}</span>
				<a
					href="#about"
					className="inline-flex shrink-0 items-center gap-2 transition-colors hover:text-paper"
				>
					Scroll <ArrowDown className="nudge h-3.5 w-3.5" />
				</a>
			</div>
		</section>
	);
}

