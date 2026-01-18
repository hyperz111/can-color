import {argv, env, platform} from 'node:process';

const terminatorPosition = argv.indexOf('--');

// Some code is from: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag) {
	const position = argv.indexOf(`--${flag}`);
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

// eslint-disable-next-line complexity -- Intentionally
export function createSupportsColor(stream, sniffFlags = true) {
	// Calculate from flag
	let flagForceColor;
	if (hasFlag('no-color') || hasFlag('no-colors')) {
		flagForceColor = false;
	} else if (hasFlag('color') || hasFlag('colors')) {
		flagForceColor = true;
	}

	// Calculate from env
	let noFlagForceColor;
	if ('FORCE_COLOR' in env) {
		switch (env.FORCE_COLOR) {
			case 'true': {
				noFlagForceColor = true;
				break;
			}

			case 'false': {
				noFlagForceColor = false;
				break;
			}

			case '': {
				noFlagForceColor = true;
				break;
			}

			default: {
				const level = Math.min(Number.parseInt(env.FORCE_COLOR, 10), 1);
				if (level > -1) {
					noFlagForceColor = Boolean(level);
				}
			}
		}
	}

	// Set to flag if "from env" is boolean
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	let forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === false) {
		return false;
	}

	// Check for Azure DevOps pipelines.
	// Has to be above the `!stream.isTTY` check.
	if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
		return true;
	}

	if (stream && !stream.isTTY && forceColor === undefined) {
		return false;
	}

	forceColor ??= false;

	if (env.TERM === 'dumb') {
		return forceColor;
	}

	if (platform === 'win32') {
		return true;
	}

	if ('CI' in env) {
		return (['TRAVIS', 'APPVEYOR', 'GITLAB_CI', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') || forceColor;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION);
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return true;
	}

	if ('COLORTERM' in env) {
		return true;
	}

	return forceColor;
}
