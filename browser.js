/* eslint-env browser */
/* eslint-disable n/no-unsupported-features/node-builtins */

export function canColor() {
	return (
		"navigator" in globalThis &&
		((globalThis.navigator.userAgentData &&
			navigator.userAgentData.brands.find(({ brand }) => brand === "Chromium")?.version > 93) ||
			/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent))
	);
}
