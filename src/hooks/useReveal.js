import { useEffect } from "react";

// Fades in every .reveal element the first time it scrolls into view.
export default function useReveal() {
	useEffect(() => {
		const els = document.querySelectorAll(".reveal:not(.is-in)");
		if (!("IntersectionObserver" in window)) {
			els.forEach((el) => el.classList.add("is-in"));
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-in");
						io.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: "0px 0px -8% 0px" },
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);
}
