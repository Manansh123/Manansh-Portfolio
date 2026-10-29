import { useLayoutEffect, useRef, useState } from "react";
import FaultyTerminal from "./FaultyTerminal";
import { toolbox } from "../data";
import { spotlight } from "../lib/pointer";

// Tint helper: the active colour at a given strength, usable in any CSS colour slot.
const mix = (tint, pct) => `color-mix(in srgb, ${tint} ${pct}%, transparent)`;

export default function Toolbox() {
	const [activeId, setActiveId] = useState(toolbox[0].id);
	const [pill, setPill] = useState({ x: 0, w: 0 });
	const tabsRef = useRef(null);
	const active = toolbox.find((c) => c.id === activeId);

	useLayoutEffect(() => {
		const measure = () => {
			const el = tabsRef.current?.querySelector(`[data-id="${activeId}"]`);
			if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
		};
		measure();
		// Web fonts change tab widths after first paint, so re-measure once they land.
		document.fonts?.ready.then(measure);
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [activeId]);

	const select = (id, el) => {
		setActiveId(id);
		el?.scrollIntoView({
			block: "nearest",
			inline: "center",
			behavior: "smooth",
		});
	};

	const onKeyDown = (e) => {
		const i = toolbox.findIndex((c) => c.id === activeId);
		const next =
			e.key === "ArrowRight"
				? (i + 1) % toolbox.length
				: e.key === "ArrowLeft"
					? (i - 1 + toolbox.length) % toolbox.length
					: e.key === "Home"
						? 0
						: e.key === "End"
							? toolbox.length - 1
							: -1;
		if (next < 0) return;
		e.preventDefault();
		const el = tabsRef.current?.querySelector(
			`[data-id="${toolbox[next].id}"]`,
		);
		el?.focus();
		select(toolbox[next].id, el);
	};

	return (
		<section id="toolbox" className="relative isolate overflow-hidden bg-black">
			{/* Background: the terminal stays alive on the right and bottom, and is calmed where text lives */}
			<div className="absolute inset-0 -z-10">
				<FaultyTerminal tint={active.tint} />
				{/* top + bottom blend into neighbouring sections */}
				<div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0b0e_0%,transparent_16%,transparent_84%,#0b0b0e_100%)]" />
				{/* left-to-right scrim: strongest behind the headline column */}
				<div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_11_14/0.78)_0%,rgb(11_11_14/0.4)_45%,transparent_80%)]" />
			</div>

			<div className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
				{/* Header + tabs sit inside a "quiet zone": soft dark halo plus a light blur that
				    melts the glyphs behind the words, fading out towards the right. */}
				<div className="relative">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -inset-x-10 -bottom-8 -top-16 -z-10 rounded-[40px]  bg-[radial-gradient(ellipse_at_20%_35%,rgb(11_11_14/0.85),rgb(11_11_14/0.55)_50%,transparent_80%)] backdrop-blur-[3px] [mask-image:linear-gradient(90deg,#000_0%,#000_50%,transparent_92%)]"
					/>

					<div className="reveal max-w-2xl">
						<h2 className="font-display text-5xl font-light tracking-tight [text-shadow:0_2px_28px_rgb(0_0_0/0.85)] sm:text-6xl">
							Things I like reaching for
						</h2>
						<p className="mt-5 text-lg text-mist [text-shadow:0_1px_16px_rgb(0_0_0/0.9)]">
							Not a buzzword list. This is what I actually use to build and
							ship.
						</p>
					</div>

					{/* Tabs live on a solid glass rail, so they never compete with the glyphs */}
					<div
						ref={tabsRef}
						role="tablist"
						aria-label="Tool categories"
						onKeyDown={onKeyDown}
						className="reveal relative mt-12 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 border-radius bg-ink/85 p-1.5 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl [scrollbar-width:none]"
					>
						<span
							aria-hidden="true"
							className="absolute bottom-1.5 left-0 top-1.5 rounded-full transition-[transform,width,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.3,1.2,0.4,1)] motion-reduce:transition-none"
							style={{
								width: pill.w,
								transform: `translateX(${pill.x}px)`,
								backgroundColor: mix(active.tint, 16),
								boxShadow: `inset 0 0 0 1px ${mix(active.tint, 50)}, 0 0 22px -4px ${mix(active.tint, 55)}`,
							}}
						/>
						{toolbox.map((c) => {
							const selected = c.id === activeId;
							return (
								<button
									key={c.id}
									type="button"
									role="tab"
									data-id={c.id}
									id={`tab-${c.id}`}
									aria-selected={selected}
									aria-controls="toolbox-panel"
									tabIndex={selected ? 0 : -1}
									onClick={(e) => select(c.id, e.currentTarget)}
									className={`relative z-10 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[16px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60 sm:px-5 ${
										selected ? "text-paper" : "text-mist hover:text-paper"
									}`}
								>
									{c.title}
								</button>
							);
						})}
					</div>
				</div>

				{/* Panel: near-opaque frosted glass with a tinted top edge, so cards always read on a calm surface */}
				<div
					id="toolbox-panel"
					role="tabpanel"
					aria-labelledby={`tab-${active.id}`}
					className="reveal relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-ink/90 p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-2xl sm:p-10"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-x-0 top-0 h-px transition-[background] duration-500"
						style={{
							background: `linear-gradient(90deg, transparent, ${mix(active.tint, 80)}, transparent)`,
						}}
					/>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 transition-[background] duration-500"
						style={{
							background: `radial-gradient(700px circle at 0% 0%, ${mix(active.tint, 10)}, transparent 60%)`,
						}}
					/>

					<div key={active.id} className="panel-in relative">
						<div className="flex items-end justify-between gap-4">
							<h3 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
								{active.subtitle}
							</h3>
							<p className="hidden shrink-0 pb-1 text-sm text-mist sm:block">
								{active.tools.length}{" "}
								{active.tools.length === 1 ? "tool" : "tools"}
							</p>
						</div>

						<ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{active.tools.map((tool) => (
								<li
									key={tool.name}
									onPointerMove={spotlight}
									className="spotlight rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 transition-colors hover:border-white/20"
								>
									<p className="flex items-center gap-2.5 text-[17px] font-medium text-paper">
										<span
											aria-hidden="true"
											className="h-3.5 w-[3px] rounded-full"
											style={{ backgroundColor: active.tint }}
										/>
										{tool.name}
									</p>
									<p className="mt-2 text-[15px] leading-relaxed text-mist">
										{tool.note}
									</p>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
