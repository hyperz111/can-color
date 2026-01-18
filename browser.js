/* eslint-env browser */
/* eslint-disable n/no-unsupported-features/node-builtins */

export function canColor() {
	return ('navigator' in globalThis) && /\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent);
}
