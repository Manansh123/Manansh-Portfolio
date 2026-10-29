const fortuneAction = { label: "Fortune cookie", command: "fortune" };
const duckAction = { label: "Meet the duck", command: "duck" };
const roastAction = { label: "Roast this shell", command: "roast" };
const playAction = { label: "Play a duel", command: "play" };
export const drawerAction = { label: "Open the desk drawer", command: "surprise" };
export const funNames = ["surprise", "fortune", "duck", "roast", "play"];

const fortunes = [
	"A great opportunity is coming. It may be disguised as an email you forgot to reply to.",
	"You will soon close a browser tab. Not today. But soon.",
	"Your next big idea will arrive just after you get comfortable in bed.",
	"The stars say: save your work. The stars have trust issues.",
	"Someone out there thinks you're the cool person. Try not to ruin it by explaining this cookie.",
	"You don't need a five-year plan to decide what to have for lunch.",
	"A small win is still a win. This cookie is counting you finding it.",
	"Today is a good day to send the message you've been overthinking.",
];
const duckNotes = [
	"No advice today. Just a very confident quack.",
	"Have you tried a snack and a dramatic sigh?",
	"You look like you know what you're doing. I will tell nobody otherwise.",
	"I have reviewed your situation. My professional opinion: quack.",
	"Please admire my posture. It is my only qualification.",
	"Sometimes the answer is a walk. Sometimes it's another biscuit.",
];
const roasts = [
	"A whole terminal for a website with six sections. Subtlety has left the chat.",
	"This shell has a desk drawer. It doesn't even have a desk. The commitment to the bit is concerning.",
	"A résumé link would have taken one click. Instead, we built lore.",
	"The terminal wants to look mysterious. Its biggest secret is a rubber duck.",
	"This website has more ways to say hello than I have social skills. I'm a text box, so the bar was low.",
	"Someone gave a blinking cursor a personality. The cursor is now insufferable.",
];
const pick = (items, random) => items[Math.floor(random() * items.length)];
const moves = ["rock", "paper", "scissors"];
const moveActions = moves.map((move) => ({ label: move, command: move }));

export function funReply(topic, random = Math.random) {
	if (topic === "fun:drawer") return {
		topic,
		out: "Desk drawer unlocked.\n\nA suspicious cookie. An unqualified duck.\nA duel with a text box.\n\nPick your side quest.",
		actions: [fortuneAction, duckAction, roastAction, playAction],
	};
	if (topic === "fun:fortune") return {
		topic,
		out: `*crunch*\n\n${pick(fortunes, random)}\n\nFortune accuracy: somewhere between a horoscope and a group chat.`,
		actions: [{ label: "Another cookie", command: "fortune" }, duckAction, drawerAction],
	};
	if (topic === "fun:duck") return {
		topic,
		out: `Quack. Emotional-support middle manager.\n   __\n <(o )___\n  ( ._> /\n   '---'\n\n“${pick(duckNotes, random)}”`,
		actions: [{ label: "Ask Quack again", command: "duck" }, fortuneAction, drawerAction],
	};
	if (topic === "fun:roast") return {
		topic,
		out: `Fine. One gentle roast, aimed at this very unnecessary shell.\n\n${pick(roasts, random)}\n\nI would defend myself, but… fair.`,
		actions: [{ label: "One more roast", command: "roast" }, playAction, drawerAction],
	};
	if (topic === "game:rps") return {
		topic,
		out: "Rock, paper, scissors. You versus a very small text box.\n\nPick a move below or type rock, paper or scissors.\nMy move is picked randomly after yours. No psychic powers involved.",
		actions: moveActions,
	};
	return null;
}

export function getFunReply(cmd, topic, random = Math.random) {
	if (topic === "game:rps" && moves.includes(cmd)) {
		const opponent = pick(moves, random);
		const win = (moves.indexOf(cmd) - moves.indexOf(opponent) + 3) % 3 === 1;
		const result = cmd === opponent
			? "A tie. Clearly we share one brain cell."
			: win ? "You win. I'll be mentioning this to absolutely nobody."
				: "I win. Putting this on my résumé would be excessive. Tempting, though.";
		return {
			topic: "game:rps",
			out: `You: ${cmd}\nShell: ${opponent}\n\n${result}\n\nAnother round? Pick a move.`,
			actions: [...moveActions, drawerAction],
		};
	}
	const triggers = [
		[/^(surprise( me)?|fun|(tell me |do )?something fun(ny)?|smth fun(ny)?|make me laugh|entertain me|(im )?bored|secret(s)?|easter eggs?|open( the)? (desk )?drawer|drawer)$/, "fun:drawer"],
		[/^(fortune(s)?( cookie)?|cookie|tell (me )?my fortune|give me a fortune)$/, "fun:fortune"],
		[/^(duck|quack|rubber duck|meet( the)? duck|ask quack)$/, "fun:duck"],
		[/^(roast( me| yourself| the shell| this shell)?|tell (me )?a joke|joke)$/, "fun:roast"],
		[/^(play|game|lets play|play( a)? game|rock[ -]paper[ -]scissors|rps|challenge( the shell)?)$/, "game:rps"],
	];
	const hit = triggers.find(([re]) => re.test(cmd));
	return hit ? funReply(hit[1], random) : null;
}
