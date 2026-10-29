import test from "node:test";
import assert from "node:assert/strict";
import { getShellReply, normalizeInput, shellNames } from "./shellCommands.js";

test("the reported conversation has useful replies and keeps contact context", () => {
	assert.match(getShellReply("yes").out, /where shall we start/);
	assert.equal(getShellReply("who u").topic, "whoami");
	assert.equal(getShellReply("i wan talk", "whoami").topic, "contact");
	assert.equal(getShellReply("contact").topic, "contact");
	const details = getShellReply("details pls", "contact");
	assert.equal(details.topic, "contact");
	assert.match(details.out, /Phone:/);
	assert.match(details.out, /Click the email address/);
});

test("natural questions resolve specific topics before generic about/who words", () => {
	for (const [input, topic] of [
		["Tell me about your projects", "projects"],
		["Where did you work?", "experience"],
		["Who did you work for?", "experience"],
		["What's your tech stack?", "skills"],
		["How do I reach you?", "contact"],
		["I wanna chat", "contact"],
		["Can I see your CV?", "resume"],
		["What do you do?", "whoami"],
		["Where are you based?", "whoami"],
	])
		assert.equal(getShellReply(input).topic, topic, input);
});

test("named projects and follow-ups return their own stack and details", () => {
	const project = getShellReply("tell me about Avant");
	assert.equal(project.topic, "project:avant");
	assert.match(project.out, /AI APIs|MongoDB/);
	assert.deepEqual(getShellReply("more pls", project.topic), project);
	assert.match(getShellReply("details", "projects").out, /Stack:/);
	assert.match(
		getShellReply("tell me more", "experience").out,
		/InAmigos|AICTE|Java/i,
	);
});

test("help and unknown input offer a clear way forward", () => {
	for (const input of [
		"help",
		"?",
		"ls",
		"what can you do",
		"menu",
		"nonsense",
		"details pls",
	]) {
		const reply = getShellReply(input);
		assert.ok(reply.actions.length >= 6, input);
		assert.match(reply.out, /projects/);
	}
	for (const command of shellNames) assert.ok(getShellReply(command), command);
});

test("normalization and controls keep familiar shell behavior", () => {
	assert.equal(normalizeInput("  WHO  ARE YOU?!  "), "who are you");
	assert.equal(getShellReply("   "), null);
	assert.equal(getShellReply("clear").operation, "clear");
	assert.equal(getShellReply("bye").operation, "exit");
	assert.equal(getShellReply("sudo rm -rf /").operation, undefined);
	assert.match(getShellReply("resume").link.href, /main_resume\.pdf$/);
});

test("side quests and their follow-ups stay usable without swallowing portfolio questions", () => {
	for (const input of ["surprise me", "I'm bored", "tell me something funny", "fortune", "duck", "roast me", "play a game"]) {
		const reply = getShellReply(input, null, () => 0);
		assert.ok(reply.out.length > 0, input);
		assert.ok(getShellReply("details pls", reply.topic, () => 0).out.length > 0, input);
		for (const action of reply.actions) {
			assert.ok(getShellReply(action.command, reply.topic, () => 0).out.length > 0, action.command);
		}
		assert.equal(getShellReply("i wan talk", reply.topic).topic, "contact");
		assert.equal(getShellReply("tell me about your projects", reply.topic).topic, "projects");
	}
	assert.equal(getShellReply("tell me about the tech stack").topic, "skills");
	assert.equal(getShellReply("coffee").topic, undefined);
});

test("rock-paper-scissors handles every result and leaves clear and exit available", () => {
	const moves = ["rock", "paper", "scissors"];
	for (const [i, player] of moves.entries()) {
		for (const [j, opponent] of moves.entries()) {
			const reply = getShellReply(player, "game:rps", () => (j + 0.5) / 3);
			assert.match(reply.out, new RegExp(`You: ${player}\\nShell: ${opponent}`));
			const expected = i === j ? /A tie/ : (i - j + 3) % 3 === 1 ? /You win/ : /I win/;
			assert.match(reply.out, expected);
		}
	}
	assert.equal(getShellReply("clear", "game:rps").operation, "clear");
	assert.equal(getShellReply("exit", "game:rps").operation, "exit");
	assert.equal(getShellReply("paper").topic, undefined);
});
