export function canColor() {
	return (
		"navigator" in globalThis &&
		(globalThis.navigator.userAgentData?.brands?.find(({ brand }) => brand === "Chromium")?.version > 93 ||
			/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent))
	);
}
