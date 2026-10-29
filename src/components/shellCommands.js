import { experience, milestones, profile, projects, toolbox } from "../data.js";
import { drawerAction, funNames, funReply, getFunReply } from "./shellFun.js";

export const shellTopics = [
	{ label: "About me", command: "whoami" },
	{ label: "Projects", command: "projects" },
	{ label: "Experience", command: "experience" },
	{ label: "Skills", command: "skills" },
	{ label: "Achievements", command: "awards" },
	{ label: "Contact", command: "contact" },
];
export const shellNames = [...shellTopics.map((t) => t.command), "resume", "help", "clear", "exit", ...funNames];

export function normalizeInput(raw) {
	const clean = raw.toLowerCase().trim().replace(/[’']/g, "").replace(/\s+/g, " ");
	return clean.replace(/[?!.,]+$/g, "") || clean;
}

const menu = {
	out: `A tiny guide to Manansh's portfolio. Pick a topic below, or ask in your own words.\n\nwhoami      Who I am\nprojects    What I've built\nexperience  Where I've worked\nskills      My tools and languages\nawards      Achievements & certifications\ncontact     Email and social links\nresume      My résumé\n\nTry "who u", "show me your projects", or "I want to talk".\nAfter a topic, "tell me more" opens the details.\nclear clears this conversation · exit or Esc closes the shell`,
	actions: [...shellTopics, drawerAction],
};

const detailsAction = { label: "Tell me more", command: "details" };
const projectActions = projects.map((p) => ({ label: p.title, command: p.id }));

function projectReply(project) {
	return {
		topic: `project:${project.id}`,
		out: `${project.title}\n${project.summary}\n\nStack: ${project.stack.join(", ")}\n${project.live ? `Live: ${project.live}\n` : ""}Code: ${project.source}`,
		actions: [...projectActions.filter((a) => a.command !== project.id), { label: "Get in touch", command: "contact" }],
	};
}

function topicReply(topic, detailed = false, random = Math.random) {
	const fun = funReply(topic, random);
	if (fun) return fun;
	const named = projects.find((p) => topic === `project:${p.id}`);
	if (named) return projectReply(named);
	const replies = {
		whoami: {
			out: `I'm ${profile.name}, a Software Engineering student at Galgotias University (2023 to 2027) with an 8.55 CGPA.\nFull Stack Developer & DSA Enthusiast with 480+ problems solved.\nExperience: Web Development Intern at InAmigos Foundation and Java Full Stack Developer Virtual Intern at AICTE Eduskills.${detailed ? `\n\nBased in ${profile.location}.\nCore skills: Java, JavaScript, React, Node.js, Express, MySQL, MongoDB, and DSA. Explore my projects or experience for details.` : "\n\nThat's me. This shell is your little shortcut around my portfolio."}`,
			actions: detailed ? [shellTopics[1], shellTopics[2], shellTopics[5]] : [detailsAction, shellTopics[1], shellTopics[5]],
		},
		projects: {
			out: `${projects.map((p) => `${p.title} — ${p.tagline}${detailed ? `\nStack: ${p.stack.join(", ")}\n${p.live ? `Live: ${p.live}\n` : ""}${p.source ? `Code: ${p.source}` : "Code: In repository"}` : ""}`).join(detailed ? "\n\n" : "\n")}\n\nPick a project below, or type its name for the stack and details.`,
			actions: projectActions,
		},
		experience: {
			out: experience.map((e) => `${e.company} — ${e.role}\n${e.period}${detailed ? ` · ${e.place}\n${e.points.map((p) => `• ${p}`).join("\n")}\nStack: ${e.stack.join(", ")}` : ""}`).join("\n\n"),
			actions: detailed ? [shellTopics[3], shellTopics[5]] : [detailsAction, shellTopics[3]],
		},
		skills: {
			out: toolbox.map((t) => `${t.title} (${t.subtitle})\n  ${t.tools.map((x) => x.name).join(", ")}`).join("\n\n"),
			actions: [shellTopics[1], shellTopics[2]],
		},
		awards: {
			out: milestones.map((m) => `${m.title}\n${m.count ? m.count + m.suffix : m.value} — ${m.detail}`).join("\n\n"),
			actions: [shellTopics[1], shellTopics[5]],
		},
		contact: {
			out: `Want to connect with ${profile.name}? Email is a great place to start.\n\nEmail: ${profile.email}\nPhone: ${profile.phone}\nLocation: ${profile.location}${profile.links.github ? `\nGitHub: ${profile.links.github}` : ""}${profile.links.linkedin ? `\nLinkedIn: ${profile.links.linkedin}` : ""}${profile.links.leetcode ? `\nLeetCode: ${profile.links.leetcode}` : ""}${profile.links.codolio ? `\nCodolio: ${profile.links.codolio}` : ""}\n\n${detailed ? "For a role or collaboration, feel free to email me directly. Click the email address to open your mail app." : "Click the email address to open your mail app. This shell only shows portfolio info; it doesn't send messages."}`,
			actions: detailed ? [{ label: "View résumé", command: "resume" }, shellTopics[1]] : [detailsAction, { label: "View résumé", command: "resume" }],
		},
		resume: {
			out: `Here's my résumé. Open the link below to view or download it.\nFor a role or collaboration, reach me at ${profile.email}.`,
			link: { label: "Open résumé (PDF)", href: profile.resume },
			actions: [shellTopics[2], shellTopics[5]],
		},
	};
	return { topic, ...replies[topic] };
}

// Local, deliberately bounded matching: no messages leave the browser.
const intents = [
	["contact", /\b(contact|email|e mail|mail|reach|hire|hiring|recruit\w*|talk|chat|connect|message|linkedin|github|leetcode|phone|number)\b/],
	["resume", /\b(resume|résumé|cv)\b/],
	["experience", /\b(experience|exp|intern\w*|jobs?|career|history|worked|employment|inamigos|aicte|eduskills)\b|where.*work|work.*history|work(?:ed)? (for|at)/],
	["skills", /\b(skills?|stack|tech\w*|tools?|toolbox|languages?)\b/],
	["awards", /\b(awards?|proud|milestones?|medals?|wins?|achievements?|certifications?|hackathon|sih|oracle|ef\s?set|dsa|rating)\b/],
	["projects", /\b(projects?|built|builds?|made|things|apps|shelf|work)\b/],
	["whoami", /\b(whoami|who|about|bio|intro\w*|education|study|studying|college|university|location|based|live)\b|^(me|you|u)$|what (do|are) (you|u) do/],
];

export function getShellReply(raw, topic = null, random = Math.random) {
	const cmd = normalizeInput(raw);
	if (!cmd) return null;
	if (/^(clear|cls)$/.test(cmd)) return { operation: "clear" };
	if (/^(exit|quit|bye|goodbye|q)$/.test(cmd)) return { operation: "exit", out: "Connection closed. Come back anytime." };
	if (/^(help|\?|man|commands|menu|hint|ls|what can (you|u) do|what else|options)$/.test(cmd)) return menu;
	const fun = getFunReply(cmd, topic, random);
	if (fun) return fun;
	const project = projects.find((p) => cmd.split(/[^a-z0-9]+/).includes(p.id) || cmd.includes(p.title.toLowerCase()));
	if (project) return projectReply(project);
	const intent = intents.find(([, re]) => re.test(cmd));
	const wantsDetails = /\b(details?|more|elaborate|explain)\b/.test(cmd);
	if (intent) return topicReply(intent[0], wantsDetails || /\b(location|based|live)\b/.test(cmd));
	if (wantsDetails) return topic ? topicReply(topic, true, random) : menu;
	if (/^(yes|yeah|yep|yup|sure|ok|okay|go on|please|pls)$/.test(cmd)) {
		return topic ? topicReply(topic, true, random) : { out: "Sure — where shall we start? Meet Manansh, explore his projects, or get in touch. Pick a topic below.", actions: [shellTopics[0], shellTopics[1], shellTopics[5]] };
	}
	if (/^(hi|hello|hey|yo|hola|namaste)( there)?$/.test(cmd)) return { out: "Hey, glad you dropped by. Want to meet Manansh, see his projects, or get in touch? Pick a topic below.", actions: [shellTopics[0], shellTopics[1], shellTopics[5]] };
	if (/^(thanks|thank you|thx|ty)$/.test(cmd)) return { out: "Anytime. The topic buttons are here if you're still curious." };
	if (/^knock knock$/.test(cmd)) return { out: "Who's there? Hopefully someone curious about projects.", actions: [shellTopics[1]] };
	if (/^sudo\b/.test(cmd)) return { out: "No sudo needed. You already have the keys to this portfolio.", actions: shellTopics };
	if (/^rm\b/.test(cmd)) return { out: "The projects are staying put. Type clear if you want a fresh conversation." };
	if (/^cd\b/.test(cmd)) return { out: "You're already home. Pick a topic below to explore.", actions: shellTopics };
	if (/^pwd$/.test(cmd)) return { out: `Manansh's portfolio. Home base: ${profile.location}.` };
	if (/^(coffee|tea)$/.test(cmd)) return { out: "Coffee, actually. Extra black. Now, shall we look at some projects?", actions: [shellTopics[1]] };
	if (/^(vim?|nano|emacs)$/.test(cmd)) return { out: "An editor you can actually leave. Press Esc to close this shell." };
	if (cmd === "date") return { out: new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" }) };
	return { out: `That one slipped past my tiny vocabulary. I can help with Manansh's background, projects, skills, experience, résumé and contact details.\n\nTry "show me your projects" or "I want to talk", or pick a topic below.`, actions: shellTopics };
}
