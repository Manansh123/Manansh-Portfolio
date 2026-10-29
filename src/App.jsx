import { useCallback, useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import About from "./components/About";
import Contact from "./components/Contact";
import Shell from "./components/Shell";
import Toolbox from "./components/Toolbox";
import Milestones from "./components/Milestones";
import CurvedLoop from "./components/CurvedLoop";
import CursorGlow from "./components/CursorGlow";
import useReveal from "./hooks/useReveal";

export default function App() {
	const [shellOpen, setShellOpen] = useState(false);
	const openShell = useCallback(() => setShellOpen(true), []);
	const closeShell = useCallback(() => setShellOpen(false), []);

	useReveal();

	// ` or Ctrl/Cmd + K toggles the shell
	useEffect(() => {
		const onKey = (e) => {
			const typing = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setShellOpen((o) => !o);
			} else if (e.key === "`" && !typing) {
				e.preventDefault();
				setShellOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<>
			<a
				href="#work"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
			>
				Skip to content
			</a>
			<CursorGlow />
			<Nav onOpenShell={openShell} />
			<main>
				<Hero />
				<About />
				<CurvedLoop
					text="Build ✦ Solve ✦ Optimize ✦ Ship ✦ Clean code & robust systems ✦ Repeat ✦"
					className="pt-10 sm:pt-16"
				/>
				<Work />
				<Experience />
				<Toolbox />
				<Milestones />
				<Contact onOpenShell={openShell} />
			</main>
			<Shell open={shellOpen} onClose={closeShell} />
		</>
	);
}
