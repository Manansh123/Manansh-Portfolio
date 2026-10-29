import { useCallback, useEffect, useRef, useState } from "react";
import { getShellReply, shellNames, shellTopics } from "./shellCommands";

const reduce = typeof window !== "undefined" && window.matchMedia
	? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
const LINK_RE = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function linkify(text) {
	return text.split(LINK_RE).map((part, i) => {
		if (i % 2 === 0) return part;
		const web = part.startsWith("http");
		return <a key={i} href={web ? part : `mailto:${part}`}
			{...(web ? { target: "_blank", rel: "noreferrer" } : {})}
			className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-rose hover:decoration-rose">{part}</a>;
	});
}

// A little terminal character, without making visitors wait to start typing.
function Out({ text, instant, onTick }) {
	const skip = instant || !!reduce?.matches;
	const [n, setN] = useState(0);
	const count = skip ? text.length : n;
	useEffect(() => {
		if (skip || n >= text.length) return;
		const t = setTimeout(() => setN((v) => Math.min(text.length, v + Math.max(1, Math.ceil(text.length / 45)))), 12);
		return () => clearTimeout(t);
	}, [n, skip, text]);
	useEffect(() => { onTick(); }, [count, onTick]);
	if (count >= text.length) return linkify(text);
	return <>
		<span aria-hidden="true">{text.slice(0, count)}<span className="sh-caret ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-rose" /></span>
		<span className="sr-only">{text}</span>
	</>;
}

function Actions({ items, onRun, label }) {
	return <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
		{items.map((item) => <button key={item.command} type="button" onClick={() => onRun(item.command)}
			className="cursor-pointer rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-mist transition-colors hover:border-rose/50 hover:bg-rose/10 hover:text-paper">{item.label}</button>)}
	</div>;
}

const css = `
@keyframes sh-in{from{opacity:0;transform:translateY(10px) scale(.985)}}
@keyframes sh-bd{from{opacity:0}}
@keyframes sh-blink{50%{opacity:0}}
.sh-bd{animation:sh-bd 200ms ease both}
.sh-in{animation:sh-in 280ms cubic-bezier(.2,.8,.2,1) both}
.sh-caret{animation:sh-blink 1s steps(1) infinite}
@media (prefers-reduced-motion:reduce){.sh-bd,.sh-in,.sh-caret{animation:none}}
`;

export default function Shell({ open, onClose }) {
	const [log, setLog] = useState([]);
	const [topic, setTopic] = useState(null);
	const [value, setValue] = useState("");
	const [cursor, setCursor] = useState(-1);
	const inputRef = useRef(null);
	const boxRef = useRef(null);
	const dialogRef = useRef(null);
	const idRef = useRef(0);
	const closeRef = useRef(0);
	const past = log.map((l) => l.cmd);
	const latest = log.at(-1);

	const scroll = useCallback(() => {
		const el = boxRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, []);

	useEffect(() => {
		if (!open) return;
		const origin = document.activeElement;
		inputRef.current?.focus();
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key !== "Tab" || e.defaultPrevented) return;
			const elements = dialogRef.current?.querySelectorAll('a[href], button:not(:disabled), input');
			if (!elements?.length) return;
			const first = elements[0];
			const last = elements[elements.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault(); last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault(); first.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
			clearTimeout(closeRef.current);
			if (origin?.isConnected) origin.focus();
		};
	}, [open, onClose]);
	useEffect(() => { if (open) scroll(); }, [log, open, scroll]);

	const run = (raw) => {
		const reply = getShellReply(raw, topic);
		if (!reply) return;
		clearTimeout(closeRef.current);
		setValue("");
		setCursor(-1);
		inputRef.current?.focus();
		if (reply.operation === "clear") {
			setLog([]);
			setTopic(null);
			return;
		}
		const id = ++idRef.current;
		setLog((l) => [...l, { id, cmd: raw.trim(), ...reply }]);
		if (reply.topic) setTopic(reply.topic);
		if (reply.operation === "exit") closeRef.current = setTimeout(onClose, reduce?.matches ? 400 : 900);
	};

	const onKeyDown = (e) => {
		if (e.key === "ArrowUp" && past.length) {
			e.preventDefault();
			const next = cursor < 0 ? past.length - 1 : Math.max(0, cursor - 1);
			setCursor(next); setValue(past[next]);
		} else if (e.key === "ArrowDown" && cursor >= 0) {
			e.preventDefault();
			const next = cursor + 1;
			setCursor(next >= past.length ? -1 : next);
			setValue(next >= past.length ? "" : past[next]);
		} else if (e.key === "Tab" && !e.shiftKey && value.trim()) {
			const matches = shellNames.filter((name) => name.startsWith(value.trim().toLowerCase()));
			if (matches.length === 1 && matches[0] !== value.trim().toLowerCase()) {
				e.preventDefault(); setValue(matches[0]);
			}
		}
	};

	if (!open) return null;
	return <div className="sh-bd fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
		<style>{css}</style>
		<div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Portfolio shell" aria-describedby="shell-intro"
			onMouseDown={(e) => e.stopPropagation()}
			className="sh-in relative flex h-[min(640px,85dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12] font-mono text-[13px] shadow-2xl shadow-black">
			<div className="flex items-center justify-between border-b border-line px-4 py-3">
				<span className="whitespace-nowrap text-paper"><span aria-hidden="true" className="mr-2 text-rose">›_</span>portfolio shell</span>
				<div className="flex items-center gap-2">
					<button type="button" onClick={() => run("help")} className="cursor-pointer rounded-md px-1 py-1 text-xs text-mist hover:text-paper">Help</button>
					<button type="button" onClick={onClose} className="cursor-pointer whitespace-nowrap rounded-md px-1 py-1 text-xs text-mist transition-colors hover:text-paper" aria-label="Close shell">Close</button>
				</div>
			</div>
			<div ref={boxRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 leading-relaxed">
				<div className="space-y-3">
					<p id="shell-intro" className="text-mist">Pick a topic or ask in your own words.</p>
					<Actions items={[...shellTopics, { label: "Résumé", command: "resume" }]} onRun={run} label="Portfolio topics" />
				</div>
				{!log.length && <div className="space-y-2 border-t border-line pt-4">
					<p className="text-paper">Hey, I'm Manansh. Glad you dropped by.</p>
					<p className="text-mist">Try “who u”, “what have you built?” or “I want to talk”.</p>
					<p className="text-xs text-dim">Psst. For the less serious stuff, try <button type="button" onClick={() => run("surprise me")} className="cursor-pointer text-mist underline decoration-white/25 underline-offset-4 hover:text-rose">“surprise me”</button>.</p>
				</div>}
				<div role="log" aria-relevant="additions" className="space-y-5">
				{log.map((l) => <div key={l.id}>
					<p><span className="text-rose">›</span> <span className="break-words text-paper">{l.cmd}</span></p>
					<pre className="mt-1 whitespace-pre-wrap break-words font-mono text-mist"><Out text={l.out} instant={l.id !== latest.id} onTick={scroll} /></pre>
					{l.link && <a href={l.link.href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-rose underline underline-offset-4">{l.link.label}</a>}
				</div>)}
				</div>
			</div>
			{latest?.actions?.length > 0 && <div className="border-t border-line px-4 py-3">
				<Actions items={latest.actions} onRun={run} label="Suggested next steps" />
			</div>}
			<form onSubmit={(e) => { e.preventDefault(); run(value); }} className="space-y-2 border-t border-line px-4 py-3">
				<div className="flex items-center gap-2">
					<span aria-hidden="true" className="text-rose">›</span>
					<input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown}
						aria-label="Ask about Manansh or type a command" aria-describedby="shell-input-hint"
						placeholder="Ask about me, my work, or getting in touch…" autoComplete="off" autoCapitalize="off" spellCheck="false"
						className="min-w-0 flex-1 rounded-sm bg-transparent px-1 py-1 text-paper caret-rose placeholder:text-dim" />
					<button type="submit" disabled={!value.trim()} className="cursor-pointer rounded-md border border-rose/30 bg-rose/10 px-3 py-1.5 text-xs text-rose transition-colors hover:bg-rose/20 disabled:cursor-default disabled:border-line disabled:bg-transparent disabled:text-dim">Send</button>
				</div>
				<p id="shell-input-hint" className="text-[11px] text-dim">Enter to send · ↑ for history · Esc to close</p>
			</form>
		</div>
	</div>;
}
