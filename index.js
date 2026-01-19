import process from "node:process";

const { argv, env, platform } = process;
const terminatorPosition = argv.indexOf("--");

// Some code is from: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag) {
	const position = argv.indexOf(flag);
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

// eslint-disable-next-line complexity -- Intentionally
export function canColor(stream, sniffFlags = true) {
	const noFlagForceColor =
		"FORCE_COLOR" in env
			? env.FORCE_COLOR === "false"
				? false
				: ["", "true"].includes(env.FORCE_COLOR) || Boolean(Math.min(+env.FORCE_COLOR, 1))
			: undefined;

	const flagForceColor =
		noFlagForceColor !== undefined
			? noFlagForceColor
			: hasFlag("--no-color")
				? false
				: hasFlag("--color")
					? true
					: undefined;

	let forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === false) {
		return false;
	}

	// Check for Azure DevOps pipelines.
	// Has to be above the `!stream.isTTY` check.
	if ("TF_BUILD" in env && "AGENT_NAME" in env) {
		return true;
	}

	if (stream && !stream.isTTY && forceColor === undefined) {
		return false;
	}

	forceColor ??= false;

	return env.TERM === "dumb"
		? forceColor
		: platform === "win32" ||
				/* prettier-ignore */
				("CI" in env && (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI", "TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship" || forceColor)) ||
				/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ||
				env.COLORTERM === "truecolor" ||
				["xterm-kitty", "xterm-ghostty", "wezterm"].includes(env.TERM) ||
				["iTerm.app", "Apple_Terminal"].includes(env.TERM_PROGRAM) ||
				/-256(color)?$/i.test(env.TERM) ||
				/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM) ||
				"COLORTERM" in env ||
				forceColor;
}
