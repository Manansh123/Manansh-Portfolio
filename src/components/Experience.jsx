import { useEffect, useRef } from "react";
import { experience } from "../data";
import { Sparkle } from "./Icons";
import { reduceMotion } from "../lib/device";

export default function Experience() {
	const railRef = useRef(null);
	const fillRef = useRef(null);

	// The rose line fills in as the timeline scrolls past the middle of the screen
	useEffect(() => {
		const rail = railRef.current;
		const fill = fillRef.current;
		if (reduceMotion) {
			fill.style.transform = "scaleY(1)";
			return;
		}
		let raf = 0;
		const update = () => {
			raf = 0;
			const r = rail.getBoundingClientRect();
			const p = (window.innerHeight * 0.6 - r.top) / r.height;
			fill.style.transform = `scaleY(${Math.min(1, Math.max(0, p))})`;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		const io = new IntersectionObserver(([e]) => {
			if (e.isIntersecting) window.addEventListener("scroll", onScroll, { passive: true });
			else window.removeEventListener("scroll", onScroll);
			update();
		});
		io.observe(rail);
		return () => {
			io.disconnect();
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<section id="experience" className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-32">
			<div className="reveal mb-16 max-w-2xl">
				<h2 className="font-display text-5xl font-light tracking-tight sm:text-6xl">
					Where I've been building things
				</h2>
				<p className="mt-5 text-lg text-mist">The teams I've worked with and what I shipped.</p>
			</div>

			<div ref={railRef} className="relative">
				<span aria-hidden="true" className="absolute bottom-3 left-[5px] top-3 w-px bg-line" />
				<span
					ref={fillRef}
					aria-hidden="true"
					className="absolute bottom-3 left-[5px] top-3 w-px origin-top bg-gradient-to-b from-rose to-rose/40"
					style={{ transform: "scaleY(0)" }}
				/>

				{experience.map((job) => (
					<article
						key={job.company}
						className="reveal relative pb-16 pl-10 last:pb-2 md:grid md:grid-cols-[13rem_1fr] md:gap-10 md:pl-14"
					>
						<span className="absolute left-0 top-[0.35rem] bg-ink p-0.5 text-rose">
							<Sparkle className="h-2 w-2" />
						</span>
						<div className="text-sm text-dim">
							<p>{job.period}</p>
							<p>{job.place}</p>
						</div>
						<div className="mt-3 md:mt-0">
							<h3 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
								{job.company}
							</h3>
							<p className="mt-1.5 text-rose">{job.role}</p>
							<ul className="mt-5 space-y-2.5 leading-relaxed text-mist">
								{job.points.map((p) => (
									<li key={p} className="flex gap-3.5">
										<Sparkle className="mt-[0.5em] h-2 w-2 shrink-0 text-white/30" />
										<span>{p}</span>
									</li>
								))}
							</ul>
							<p className="mt-5 font-mono text-[13px] text-dim">{job.stack.join(" / ")}</p>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
