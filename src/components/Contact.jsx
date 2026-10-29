import { useEffect, useRef, useState } from "react";
import Dither from "./Dither";
import { ArrowUpRight, Codolio, GitHub, LeetCode, LinkedIn } from "./Icons";
import { profile } from "../data";

const socials = [
	{ label: "GitHub", href: profile.links.github, Icon: GitHub },
	{ label: "LinkedIn", href: profile.links.linkedin, Icon: LinkedIn },
	{ label: "LeetCode", href: profile.links.leetcode, Icon: LeetCode },
	{ label: "Codolio", href: profile.links.codolio, Icon: Codolio },
];

/* ─────────────────────────── helpers ─────────────────────────── */

const motionQuery =
	typeof window !== "undefined" && window.matchMedia
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;

const canMove = (e) => e.pointerType === "mouse" && !motionQuery?.matches;

const COPY_LINES = [
	"Copied. Now say hi.",
	"Copied again.",
	"Still on your clipboard.",
	"You could just write it.",
];

/* ── reply availability ────────────────────────────────────────── */

const IST = "Asia/Kolkata";
const IST_OFFSET = 330;
const ONLINE_AT = 8;

const clockFmt = new Intl.DateTimeFormat("en-IN", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
	timeZone: IST,
});

const hmFmt = new Intl.DateTimeFormat("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
	timeZone: IST,
});

const localFmt = new Intl.DateTimeFormat(undefined, {
	hour: "numeric",
	minute: "2-digit",
});

const offsetNote = (now) => {
	const diff = IST_OFFSET + now.getTimezoneOffset();

	if (diff === 0) return "same time zone as you";

	const abs = Math.abs(diff);
	const h = Math.floor(abs / 60);
	const m = abs % 60;

	return `${h}h${m ? ` ${m}m` : ""} ${diff > 0 ? "ahead of" : "behind"} you`;
};

const availability = (now) => {
	const [h, m] = hmFmt.format(now).split(":").map(Number);

	if (h < 7 || h >= 23) {
		const wait = (ONLINE_AT * 60 - (h * 60 + m) + 1440) % 1440;

		const back = new Date(now.getTime() + wait * 60000);

		return {
			awake: false,
			text: `Away for the night. Usually back around ${localFmt.format(
				back,
			)} your time.`,
		};
	}

	return {
		awake: true,
		text:
			h < 9
				? "Just getting started. Coffee first, then email."
				: h < 18
					? "Usually around and checking email during the day."
					: "Winding down, but I still check email.",
	};
};

/* "https://github.com/name/" -> "@name" */
const handleOf = (href) => {
	try {
		const part = new URL(href).pathname
			.split("/")
			.filter(Boolean)
			.find((p) => p !== "in" && p !== "u");

		return part ? `@${part}` : "";
	} catch {
		return "";
	}
};

/* Shared look for links */
const draw =
	"relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-rose after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100";

const ring =
	"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-rose/60";

const item =
	"group inline-flex items-center gap-2 py-1 text-[15px] text-mist transition-[color,scale] duration-200 hover:text-paper focus-visible:text-paper active:scale-[0.96]";

function useInView(threshold = 0.6, once = true) {
	const ref = useRef(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (!("IntersectionObserver" in window)) {
			setInView(true);
			return;
		}

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);

					if (once) {
						io.disconnect();
					}
				} else if (!once) {
					setInView(false);
				}
			},
			{ threshold },
		);

		io.observe(el);

		return () => io.disconnect();
	}, [threshold, once]);

	return [ref, inView];
}

function useClock() {
	const [now, setNow] = useState(null);

	useEffect(() => {
		const tick = () => setNow(new Date());

		tick();

		const id = setInterval(tick, 30000);

		return () => clearInterval(id);
	}, []);

	return now;
}

/* Layered depth */
function useParallax(ref) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const layers = [...el.querySelectorAll("[data-depth]")];

		const s = {
			tx: 0,
			ty: 0,
			x: 0,
			y: 0,
			raf: 0,
		};

		const tick = () => {
			s.x += (s.tx - s.x) * 0.08;
			s.y += (s.ty - s.y) * 0.08;

			for (const layer of layers) {
				const d = Number(layer.dataset.depth);

				layer.style.transform = `translate3d(${(s.x * d).toFixed(
					2,
				)}px, ${(s.y * d * 0.6).toFixed(2)}px, 0)`;
			}

			const settled =
				Math.abs(s.tx - s.x) < 0.002 && Math.abs(s.ty - s.y) < 0.002;

			s.raf = settled ? 0 : requestAnimationFrame(tick);
		};

		const kick = () => {
			if (!s.raf) {
				s.raf = requestAnimationFrame(tick);
			}
		};

		const move = (e) => {
			if (!canMove(e)) return;

			const r = el.getBoundingClientRect();

			s.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
			s.ty = ((e.clientY - r.top) / r.height) * 2 - 1;

			kick();
		};

		const leave = () => {
			s.tx = 0;
			s.ty = 0;

			kick();
		};

		el.addEventListener("pointermove", move, { passive: true });
		el.addEventListener("pointerleave", leave);

		return () => {
			cancelAnimationFrame(s.raf);
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerleave", leave);
		};
	}, [ref]);
}

/* ───────────────────────── components ────────────────────────── */

function Magnetic({ children, pull = 0.28 }) {
	const inner = useRef(null);

	const move = (e) => {
		if (!canMove(e) || !inner.current) return;

		const r = e.currentTarget.getBoundingClientRect();

		const x = (e.clientX - (r.left + r.width / 2)) * pull;
		const y = (e.clientY - (r.top + r.height / 2)) * pull;

		const s = inner.current.style;

		s.transition = "transform 140ms ease-out";
		s.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
	};

	const leave = () => {
		const s = inner.current?.style;
		if (!s) return;

		s.transition = "transform 650ms cubic-bezier(.34,1.56,.64,1)";
		s.transform = "";
	};

	return (
		<span
			onPointerMove={move}
			onPointerLeave={leave}
			className="-m-3 inline-flex p-3"
		>
			<span ref={inner} className="inline-flex">
				{children}
			</span>
		</span>
	);
}

/* Email is the centrepiece */
function Email({ address, wave, drawn }) {
	const chars = useRef([]);
	const centers = useRef([]);
	const pointerX = useRef(0);
	const raf = useRef(0);

	useEffect(() => {
		return () => cancelAnimationFrame(raf.current);
	}, []);

	const measure = (e) => {
		if (!canMove(e)) return;

		centers.current = chars.current.map((el) => {
			const r = el.getBoundingClientRect();
			return r.left + r.width / 2;
		});
	};

	const apply = () => {
		raf.current = 0;

		chars.current.forEach((el, i) => {
			if (!el) return;

			const t = Math.max(
				0,
				1 - Math.abs(pointerX.current - centers.current[i]) / 84,
			);

			el.style.transform = t
				? `translate3d(0, ${(-7 * t * t).toFixed(2)}px, 0)`
				: "";
		});
	};

	const move = (e) => {
		if (!canMove(e)) return;

		pointerX.current = e.clientX;

		if (!raf.current) {
			raf.current = requestAnimationFrame(apply);
		}
	};

	const leave = () => {
		cancelAnimationFrame(raf.current);
		raf.current = 0;

		chars.current.forEach((el) => el && (el.style.transform = ""));
	};

	return (
		<a
			href={`mailto:${address}`}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`Email ${address}`}
			onPointerEnter={measure}
			onPointerMove={move}
			onPointerLeave={leave}
			className="group/mail relative inline-block whitespace-nowrap font-display text-[clamp(1.15rem,4.4vw,2.6rem)] leading-tight transition-colors duration-300 hover:text-rose focus-visible:text-rose focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-rose/60"
		>
			<span
				key={wave}
				aria-hidden="true"
				className={wave ? "ct-wave" : undefined}
			>
				{[...address].map((c, i) => (
					<span
						key={i}
						ref={(el) => (chars.current[i] = el)}
						className="ct-char inline-block"
						style={{ "--i": i }}
					>
						{c}
					</span>
				))}
			</span>

			<span
				aria-hidden="true"
				className={`absolute inset-x-0 -bottom-2 h-px origin-left bg-white/25 transition-transform duration-[1400ms] ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:scale-x-100 motion-reduce:transition-none ${drawn ? "scale-x-100" : "scale-x-0"
					}`}
			/>

			<span
				aria-hidden="true"
				className="absolute inset-x-0 -bottom-2 h-px origin-right scale-x-0 bg-rose transition-transform duration-500 ease-out group-hover/mail:origin-left group-hover/mail:scale-x-100 group-focus-visible/mail:origin-left group-focus-visible/mail:scale-x-100"
			/>
		</a>
	);
}

/* Comic-style impact ticks: [x1, y1, x2, y2], radiating from the bottom-left */
const TICKS = [
	[9.7, 15.9, 17.5, 13.9],
	[7.7, 12.3, 13.3, 6.7],
	[4.1, 10.3, 6.1, 2.5],
];

/* Shell trigger: a pill that gets "knocked" to draw attention */
function Knock({ onOpen }) {
	const [ref, visible] = useInView(0.9, false);
	const [dwell, setDwell] = useState(false);
	const [knocking, setKnocking] = useState(false);
	const openTimer = useRef(0);

	useEffect(() => {
		if (!visible || dwell) return;

		const t = setTimeout(() => setDwell(true), 3500);

		return () => clearTimeout(t);
	}, [visible, dwell]);

	useEffect(() => () => clearTimeout(openTimer.current), []);

	const open = () => {
		if (motionQuery?.matches) return onOpen();

		setKnocking(true);

		openTimer.current = setTimeout(() => {
			setKnocking(false);
			onOpen();
		}, 420);
	};

	return (
		<button
			ref={ref}
			type="button"
			onClick={open}
			aria-label="Open the portfolio shell"
			className={`group relative inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border border-rose/30 bg-rose/[0.06] py-2 pl-5 pr-4 text-[15px] text-rose transition-[color,background-color,border-color] duration-200 hover:border-rose hover:bg-rose/10 hover:text-paper focus-visible:border-rose focus-visible:text-paper focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-rose/60 active:scale-[0.96] ${knocking
					? "ct-knock"
					: dwell
						? "ct-nudge"
						: "opacity-0 focus-visible:opacity-100"
				}`}
		>
			<span aria-hidden="true" className="grid">
				<span className="col-start-1 row-start-1 transition duration-300 group-hover:-translate-y-1 group-hover:opacity-0 group-focus-visible:-translate-y-1 group-focus-visible:opacity-0">
					psst…
					<span className="hidden [@media(hover:none)]:inline"> tap me</span>
				</span>

				<span className="col-start-1 row-start-1 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
					knock, knock
				</span>
			</span>

			<span
				aria-hidden="true"
				className="ct-caret block h-[1.05em] w-[0.5em] bg-current group-hover:[animation:none]"
			/>

			{/* impact ticks */}
			<svg
				aria-hidden="true"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				className="pointer-events-none absolute -right-3.5 -top-3.5 size-5 overflow-visible text-rose transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
			>
				{TICKS.map(([x1, y1, x2, y2], i) => (
					<line
						key={i}
						className="ct-tick"
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						style={{ "--k": i }}
					/>
				))}
			</svg>
		</button>
	);
}

/* Live reply status: solid dot when around, hollow ring when away */
function Availability({ now }) {
	if (!now) return null;

	const { awake, text } = availability(now);

	return (
		<>
			<span
				aria-hidden="true"
				className={`mt-[0.4em] inline-block size-2 shrink-0 rounded-full ${awake ? "bg-rose" : "border border-current"
					}`}
			/>

			<span>
				{clockFmt.format(now)} in Greater Noida, {offsetNote(now)}. {text}
			</span>
		</>
	);
}

const css = `
@keyframes ct-wave {
    35% {
        transform: translateY(-.16em);
        color: var(--color-rose, #A9515A);
    }
}

@keyframes ct-roll {
    from {
        opacity: 0;
        transform: translateY(.6em);
    }
}

@keyframes ct-blink {
    50% {
        opacity: 0;
    }
}

@keyframes ct-pop {
    from {
        opacity: 0;
        transform: translateY(.6rem) scale(.85);
    }
    60% {
        transform: translateY(-.15rem) scale(1.05);
    }
}

/* knock, knock ... pause. Shared 3.2s cycle with ct-tick */
@keyframes ct-bump {
    0%, 12%, 34%, 100% { scale: 1; rotate: 0deg; }
    5%  { scale: 1.05; rotate: -2deg; }
    27% { scale: 1.05; rotate: 2deg; }
}

@keyframes ct-tick {
    0%   { opacity: 0; transform: scale(.7); }
    5%   { opacity: 1; transform: scale(1); }
    15%  { opacity: 0; transform: scale(1.18); }
    22%  { opacity: 0; transform: scale(.7); }
    27%  { opacity: 1; transform: scale(1); }
    37%  { opacity: 0; transform: scale(1.18); }
    100% { opacity: 0; transform: scale(1.18); }
}

@keyframes ct-knock {
    0%, 100% { translate: 0 0; rotate: 0deg; }
    20% { translate: -3px 0; rotate: -4deg; }
    40% { translate: 3px 0; rotate: 4deg; }
    60% { translate: -2px 0; rotate: -2deg; }
    80% { translate: 2px 0; rotate: 2deg; }
}

.ct-char {
    transition: transform 220ms cubic-bezier(.2,.8,.2,1);
}

.ct-wave .ct-char {
    animation: ct-wave 760ms cubic-bezier(.3,.7,.3,1) both;
    animation-delay: calc(var(--i) * 24ms);
}

.ct-roll {
    animation: ct-roll 380ms cubic-bezier(.2,.8,.2,1) both;
}

.ct-caret {
    animation: ct-blink 1.15s steps(1) infinite;
}

.ct-tick {
    opacity: 0;
    transform-box: view-box;
    transform-origin: 2px 18px;
}

.ct-nudge {
    animation:
        ct-pop 520ms cubic-bezier(.2,.8,.2,1) both,
        ct-bump 3.2s ease-in-out 1s infinite;
}

.ct-nudge .ct-tick {
    animation: ct-tick 3.2s ease-out infinite;
    animation-delay: calc(1s + var(--k) * 60ms);
}

.ct-nudge:hover,
.ct-nudge:focus-visible {
    animation-play-state: paused;
}

.ct-knock {
    animation: ct-knock 420ms ease-in-out both;
}

@media (prefers-reduced-motion: reduce) {
    .ct-wave .ct-char,
    .ct-roll,
    .ct-caret,
    .ct-nudge,
    .ct-nudge .ct-tick,
    .ct-knock {
        animation: none;
    }
}
`;

/* ─────────────────────────── section ─────────────────────────── */

export default function Contact({ onOpenShell }) {
	const sceneRef = useRef(null);
	const timer = useRef(0);

	const [copied, setCopied] = useState(false);
	const [copies, setCopies] = useState(0);
	const [wave, setWave] = useState(0);

	const [mailRef, mailIn] = useInView(0.6);
	const [ruleRef, ruleIn] = useInView(0.9);

	const now = useClock();

	useParallax(sceneRef);

	useEffect(() => {
		return () => clearTimeout(timer.current);
	}, []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(profile.email);

			setCopies((c) => c + 1);
			setWave((w) => w + 1);
			setCopied(true);

			clearTimeout(timer.current);

			timer.current = setTimeout(() => setCopied(false), 2600);
		} catch {
			window.location.href = `mailto:${profile.email}`;
		}
	};

	const label = copied
		? COPY_LINES[Math.min(copies - 1, COPY_LINES.length - 1)]
		: "Copy";

	return (
		<section
			ref={sceneRef}
			id="contact"
			className="relative isolate overflow-hidden"
		>
			<style>{css}</style>

			{/* far layer */}
			<div className="absolute -inset-5 -z-10" data-depth="-4">
				<Dither />

				<div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0b0e_0%,rgb(11_11_14/0.65)_30%,rgb(11_11_14/0.25)_70%,rgb(11_11_14/0.7)_100%)]" />
			</div>

			<div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-40">
				{/* heading */}
				<div data-depth="-7">
					<h2 className="reveal font-display max-w-4xl text-[clamp(3rem,8.5vw,7.5rem)] font-light leading-[0.98] tracking-[-0.03em]">
						Got something worth{" "}
						<em className="font-normal text-rose">building</em>?
					</h2>

					<p
						className="reveal mt-8 max-w-xl text-lg leading-relaxed text-mist"
						style={{ "--delay": "100ms" }}
					>
						I'm looking for full-stack and backend roles, and I'm always happy
						to talk about a project or a strange bug.
					</p>
				</div>

				{/* contact links */}
				<div data-depth="5">
					<div className="relative w-fit max-w-full">
						<div
							aria-hidden="true"
							className="pointer-events-none absolute -left-8 -top-7 -z-10 h-[calc(100%+3.5rem)] w-[calc(100%+4rem)] rounded-[64px] bg-[radial-gradient(ellipse_at_18%_40%,rgb(11_11_14/0.5)_0%,rgb(11_11_14/0.34)_42%,rgb(11_11_14/0.16)_72%,transparent_100%)] backdrop-blur-[1.5px]"
						/>
						<div
							ref={mailRef}
							className="reveal mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
							style={{ "--delay": "180ms" }}
						>
							<Email address={profile.email} wave={wave} drawn={mailIn} />

							<Magnetic>
								<button
									type="button"
									onClick={copy}
									className={`${draw} ${ring} cursor-pointer py-1 text-sm text-mist transition-[color,scale] duration-200 before:absolute before:inset-x-0 before:-bottom-1 before:h-px before:bg-white/20 hover:text-paper active:scale-[0.96]`}
								>
									<span aria-live="polite">
										<span key={label} className="ct-roll inline-block">
											{label}
										</span>
									</span>
								</button>
							</Magnetic>
						</div>

						{/* useful, contextual time information */}
						<p
							className="reveal mt-5 flex min-h-5 max-w-xl items-start gap-2.5 text-sm tabular-nums text-dim"
							style={{ "--delay": "210ms" }}
						>
							<Availability now={now} />
						</p>

						<ul
							className="reveal mt-9 flex flex-wrap gap-x-8 gap-y-2"
							style={{ "--delay": "240ms" }}
						>
							{socials.map(({ label: name, href, Icon }) => (
								<li key={name} className="flex">
									<Magnetic>
										<a
											href={href || "#"}
											{...(href ? { target: "_blank", rel: "noreferrer" } : {})}
											className={`${item} ${draw} ${ring}`}
											title={href ? undefined : `Configure ${name} profile in src/data.js`}
										>
											<span className="inline-flex transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
												<Icon />
											</span>

											{name}

											{href && (
												<span
													aria-hidden="true"
													className="pointer-events-none absolute left-0 top-full mt-3 translate-y-1 whitespace-nowrap text-xs text-dim opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
												>
													{handleOf(href)}
												</span>
											)}
										</a>
									</Magnetic>
								</li>
							))}

							<li className="flex">
								<Magnetic>
									<a
										href={profile.resume}
										download="Manansh_Gupta_Resume.pdf"
										target="_blank"
										rel="noreferrer"
										className={`${item} ${draw} ${ring} !gap-1.5`}
									>
										Resume
										<span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
											<ArrowUpRight />
										</span>
									</a>
								</Magnetic>
							</li>

							<li className="flex">
								<Magnetic>
									<a
										href={`tel:${profile.phoneHref}`}
										className={`${item} ${draw} ${ring}`}
									>
										{profile.phone}
									</a>
								</Magnetic>
							</li>
						</ul>
					</div>
				</div>

				{/* closing rule */}
				<div
					ref={ruleRef}
					aria-hidden="true"
					className={`mt-28 h-px origin-left bg-line transition-transform duration-[1600ms] ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:scale-x-100 motion-reduce:transition-none ${ruleIn ? "scale-x-100" : "scale-x-0"
						}`}
				/>

				<footer className="flex flex-col items-start gap-5 pt-8 text-sm text-dim sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {new Date().getFullYear()} Manansh Gupta. Designed and built in
						Greater Noida.
					</p>

					<Knock onOpen={onOpenShell} />
				</footer>
			</div>
		</section>
	);
}
