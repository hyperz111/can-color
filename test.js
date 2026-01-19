import { randomInt } from "node:crypto";
import process from "node:process";
import os from "node:os";
import tty from "node:tty";
import { test } from "node:test";

const currentNodeVersion = process.versions.node;

const importFresh = async (moduleName) => import(`${moduleName}?${randomInt(100_000_000)}`);

const importMain = async () => {
	const { canColor } = await importFresh("./index.js");
	return canColor(process.stdout);
};

test.beforeEach(() => {
	Object.defineProperty(process, "platform", {
		value: "linux",
	});

	Object.defineProperty(process.versions, "node", {
		value: currentNodeVersion,
	});

	process.stdout.isTTY = true;
	process.argv = [];
	process.env = {};
	tty.isatty = () => true;
});

test("return true if `FORCE_COLOR` is in env", async (t) => {
	process.stdout.isTTY = false;
	process.env.FORCE_COLOR = "true";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `FORCE_COLOR` is in env, but with --color flag", async (t) => {
	process.argv = ["--color"];
	process.env.FORCE_COLOR = "true";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `FORCE_COLOR` is in env, but with --color flag #2", async (t) => {
	process.argv = ["--color"];
	process.env.FORCE_COLOR = "1";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return false if `FORCE_COLOR` is in env and is 0", async (t) => {
	process.env.FORCE_COLOR = "0";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("do not cache `FORCE_COLOR`", async (t) => {
	process.env.FORCE_COLOR = "0";
	const result = await importMain();
	t.assert.equal(result, false);

	const { canColor } = await importFresh("./index.js");
	process.env.FORCE_COLOR = "1";
	const updatedStdOut = canColor({ isTTY: tty.isatty(1) });
	t.assert.equal(updatedStdOut, true);
});

test("return false if not TTY", async (t) => {
	process.stdout.isTTY = false;
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return false if --no-color flag is used", async (t) => {
	process.env = { TERM: "xterm-256color" };
	process.argv = ["--no-color"];
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return true if --color flag is used", async (t) => {
	process.argv = ["--color"];
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `COLORTERM` is in env", async (t) => {
	process.env.COLORTERM = true;
	const result = await importMain();
	t.assert.equal(result, true);
});

test("ignore post-terminator flags", async (t) => {
	process.argv = ["--color", "--", "--no-color"];
	const result = await importMain();
	t.assert.equal(result, true);
});

test("allow tests of the properties on false", async (t) => {
	process.env = { TERM: "xterm-256color" };
	process.argv = ["--no-color"];
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return false if `CI` is in env", async (t) => {
	process.env.CI = "AppVeyor";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return true if `TRAVIS` is in env", async (t) => {
	process.env = { CI: "Travis", TRAVIS: "1" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 3 if `CIRCLECI` is in env", async (t) => {
	process.env = { CI: true, CIRCLECI: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `APPVEYOR` is in env", async (t) => {
	process.env = { CI: true, APPVEYOR: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `GITLAB_CI` is in env", async (t) => {
	process.env = { CI: true, GITLAB_CI: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `BUILDKITE` is in env", async (t) => {
	process.env = { CI: true, BUILDKITE: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if `DRONE` is in env", async (t) => {
	process.env = { CI: true, DRONE: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 3 if `GITEA_ACTIONS` is in env", async (t) => {
	process.env = { CI: true, GITEA_ACTIONS: true };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return true if Codeship is in env", async (t) => {
	process.env = { CI: true, CI_NAME: "codeship" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return false if `TEAMCITY_VERSION` is in env and is < 9.1", async (t) => {
	process.env.TEAMCITY_VERSION = "9.0.5 (build 32523)";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return level 1 if `TEAMCITY_VERSION` is in env and is >= 9.1", async (t) => {
	process.env.TEAMCITY_VERSION = "9.1.0 (build 32523)";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("support rxvt", async (t) => {
	process.env = { TERM: "rxvt" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("prefer level 2/xterm over COLORTERM", async (t) => {
	process.env = { COLORTERM: "1", TERM: "xterm-256color" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("support screen-256color", async (t) => {
	process.env = { TERM: "screen-256color" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("support putty-256color", async (t) => {
	process.env = { TERM: "putty-256color" };
	const result = await importMain();
	t.assert.equal(result, true);
});

test("level should be 3 when using iTerm 3.0", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "darwin",
	});
	process.env = {
		TERM_PROGRAM: "iTerm.app",
		TERM_PROGRAM_VERSION: "3.0.10",
	};
	const result = await importMain();
	t.assert.equal(result, true);
});

test("level should be 2 when using iTerm 2.9", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "darwin",
	});
	process.env = {
		TERM_PROGRAM: "iTerm.app",
		TERM_PROGRAM_VERSION: "2.9.3",
	};
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 1 if on Windows earlier than 10 build 10586", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "win32",
	});
	Object.defineProperty(process.versions, "node", {
		value: "8.0.0",
	});
	os.release = () => "10.0.10240";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 2 if on Windows 10 build 10586 or later", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "win32",
	});
	Object.defineProperty(process.versions, "node", {
		value: "8.0.0",
	});
	os.release = () => "10.0.10586";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 3 if on Windows 10 build 14931 or later", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "win32",
	});
	Object.defineProperty(process.versions, "node", {
		value: "8.0.0",
	});
	os.release = () => "10.0.14931";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("return level 2 when FORCE_COLOR is set when not TTY in xterm256", async (t) => {
	process.stdout.isTTY = false;
	process.env.FORCE_COLOR = "true";
	process.env.TERM = "xterm-256color";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("supports setting a color level using FORCE_COLOR", async (t) => {
	let result;
	process.env.FORCE_COLOR = "1";
	result = await importMain();
	t.assert.equal(result, true);

	process.env.FORCE_COLOR = "2";
	result = await importMain();
	t.assert.equal(result, true);

	process.env.FORCE_COLOR = "3";
	result = await importMain();
	t.assert.equal(result, true);

	process.env.FORCE_COLOR = "0";
	result = await importMain();
	t.assert.equal(result, false);
});

test("FORCE_COLOR maxes out at a value of 3", async (t) => {
	process.env.FORCE_COLOR = "4";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("FORCE_COLOR works when set via command line (all values are strings)", async (t) => {
	let result;
	process.env.FORCE_COLOR = "true";
	result = await importMain();
	t.assert.equal(result, true);

	process.stdout.isTTY = false;
	process.env.FORCE_COLOR = "true";
	process.env.TERM = "xterm-256color";
	result = await importMain();
	t.assert.equal(result, true);

	process.env.FORCE_COLOR = "false";
	result = await importMain();
	t.assert.equal(result, false);
});

test("return false when `TERM` is set to dumb", async (t) => {
	process.env.TERM = "dumb";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return false when `TERM` is set to dumb when `TERM_PROGRAM` is set", async (t) => {
	process.env.TERM = "dumb";
	process.env.TERM_PROGRAM = "Apple_Terminal";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return false when `TERM` is set to dumb when run on Windows", async (t) => {
	Object.defineProperty(process, "platform", {
		value: "win32",
	});
	Object.defineProperty(process.versions, "node", {
		value: "10.13.0",
	});
	os.release = () => "10.0.14931";
	process.env.TERM = "dumb";
	const result = await importMain();
	t.assert.equal(result, false);
});

test("return level 1 when `TERM` is set to dumb when `FORCE_COLOR` is set", async (t) => {
	process.env.FORCE_COLOR = "1";
	process.env.TERM = "dumb";
	const result = await importMain();
	t.assert.equal(result, true);
});

test("ignore flags when sniffFlags=false", async (t) => {
	process.argv = ["--color"];
	process.env.TERM = "dumb";
	const { canColor } = await importFresh("./index.js");
	const result = await importMain();

	t.assert.equal(result, true);

	const sniffResult = canColor(process.stdout, true);
	t.assert.equal(sniffResult, true);

	const nosniffResult = canColor(process.stdout, false);
	t.assert.equal(nosniffResult, false);
});
