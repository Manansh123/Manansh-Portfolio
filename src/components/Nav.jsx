import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mark, Sparkle } from "./Icons";
import { profile } from "../data";

const links = [
	{ id: "about", label: "About" },
	{ id: "work", label: "Projects" },
	{ id: "experience", label: "Experience" },
	{ id: "toolbox", label: "Skills" },
	{ id: "milestones", label: "Achievements" },
];
const mobileLinks = [...links, { id: "contact", label: "Contact" }];

export default function Nav({ onOpenShell }) {
	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(null);
	const [spark, setSpark] = useState(null);
	const listRef = useRef(null);
	const progressRef = useRef(null);

	// Background after the hero starts, hide on scroll down, progress hairline
	useEffect(() => {
		let lastY = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			setScrolled(y > 24);
			if (y > lastY + 6 && y > 480) setHidden(true);
			else if (y < lastY - 6 || y <= 480) setHidden(false);
			lastY = y;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			if (progressRef.current) {
				progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
			}
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Which section is in the middle of the screen
	useEffect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) setActive(e.target.id);
				});
			},
			{ rootMargin: "-45% 0px -50% 0px" },
		);
		["top", ...mobileLinks.map((l) => l.id)].forEach((id) => {
			const el = document.getElementById(id);
			if (el) io.observe(el);
		});
		return () => io.disconnect();
	}, []);

	// Slide the sparkle under the active link
	useLayoutEffect(() => {
		const measure = () => {
			const el = listRef.current?.querySelector(`[data-id="${active}"]`);
			setSpark(el ? el.offsetLeft + el.offsetWidth / 2 : null);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [active]);

	// Mobile menu: lock scroll and close on Escape
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const solid = scrolled && !open;

	return (
		<>
			<header
				onFocusCapture={() => setHidden(false)}
				className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-300 ${
					hidden && !open ? "-translate-y-full" : "translate-y-0"
				} ${
					solid
						? "border-b border-line bg-ink/75 backdrop-blur-xl"
						: "border-b border-transparent"
				}`}
			>
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
					<a
						href="#top"
						onClick={() => setOpen(false)}
						className="group flex items-center gap-2.5"
						aria-label={`${profile.name}, back to top`}
					>
						<Mark className="h-8 w-8 text-paper transition-colors duration-300 group-hover:text-rose" />
						<span className="font-sans text-[1.05rem] font-medium tracking-[0.12em] uppercase text-paper/90">
							Manansh
						</span>
					</a>

					<nav aria-label="Sections" className="hidden lg:block">
						<ul
							ref={listRef}
							className="font-sans relative flex items-center gap-8"
						>
							{links.map((l) => (
								<li key={l.id}>
									<a
										href={`#${l.id}`}
										data-id={l.id}
										aria-current={active === l.id ? "true" : undefined}
										className={`block py-2 text-[17px] transition-colors ${
											active === l.id
												? "text-paper"
												: "text-mist hover:text-paper"
										}`}
									>
										{l.label}
									</a>
								</li>
							))}
							<li
								aria-hidden="true"
								className="pointer-events-none absolute -bottom-1.5 left-0 text-rose transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.3,1.4,0.5,1)]"
								style={{
									transform: `translateX(${(spark ?? 0) - 5}px)`,
									opacity: spark == null ? 0 : 1,
								}}
							>
								<Sparkle className="h-2.5 w-2.5" />
							</li>
						</ul>
					</nav>

					<div className="hidden items-center gap-5 lg:flex">
						<button
							type="button"
							onClick={onOpenShell}
							title="Open the shell (press ` or Ctrl K)"
							className="cursor-pointer font-mono text-[13px] text-dim transition-colors hover:text-rose"
						>
							&gt;_
						</button>
						<a
							href={profile.resume}
							download="Manansh_Gupta_Resume.pdf"
							target="_blank"
							rel="noreferrer"
							className="link-line text-[16px] text-mist hover:text-paper duration-200"
						>
							Resume
						</a>
						<a
							href="#contact"
							className="rounded-full bg-paper px-4 py-1.5 text-[15.5px] font-medium text-ink transition-colors hover:bg-rose duration-200"
						>
							Say hi
						</a>
					</div>

					<button
						type="button"
						onClick={() => setOpen((o) => !o)}
						aria-label={open ? "Close menu" : "Open menu"}
						aria-expanded={open}
						aria-controls="mobile-menu"
						className="relative -mr-2 h-11 w-11 lg:hidden"
					>
						<span
							className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-transform duration-300 ${
								open ? "rotate-45" : "-translate-y-[4px]"
							}`}
						/>
						<span
							className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-transform duration-300 ${
								open ? "-rotate-45" : "translate-y-[4px]"
							}`}
						/>
					</button>
				</div>

				<div
					ref={progressRef}
					aria-hidden="true"
					className="absolute inset-x-0 bottom-0 h-px origin-left bg-rose/70"
					style={{ transform: "scaleX(0)" }}
				/>
			</header>

			<div
				id="mobile-menu"
				className={`fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-ink px-6 pb-10 pt-28 transition-opacity duration-300 lg:hidden ${
					open ? "opacity-100" : "pointer-events-none invisible opacity-0"
				}`}
			>
				<Mark className="pointer-events-none absolute -bottom-20 -right-24 h-[26rem] w-[26rem] text-rose opacity-[0.06]" />
				<nav aria-label="Sections" className="relative">
					<ul className="space-y-1">
						{mobileLinks.map((l, i) => (
							<li
								key={l.id}
								className={`transition-[opacity,transform] duration-500 ${
									open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
								}`}
								style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
							>
								<a
									href={`#${l.id}`}
									onClick={() => setOpen(false)}
									className={`font-display block py-1.5 text-[2.75rem] leading-tight tracking-tight ${
										active === l.id ? "text-rose" : "text-paper/80"
									}`}
								>
									{l.label}
								</a>
							</li>
						))}
					</ul>
				</nav>
				<div className="relative flex gap-3">
					<a
						href={profile.resume}
						download="Manansh_Gupta_Resume.pdf"
						target="_blank"
						rel="noreferrer"
						className="flex-1 rounded-full bg-paper py-3 text-center font-medium text-ink"
					>
						Resume
					</a>
					<button
						type="button"
						onClick={() => {
							setOpen(false);
							onOpenShell();
						}}
						className="flex-1 rounded-full border border-white/15 py-3 font-mono text-sm text-mist"
					>
						&gt;_ shell
					</button>
				</div>
			</div>
		</>
	);
}
