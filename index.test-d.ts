import { stdout, stderr } from "node:process";
import { expect, test } from "tstyche";
import { canColor } from "./index.js";

test("can-color", () => {
	expect(canColor(stdout)).type.toBe<boolean>();
	expect(canColor(stderr)).type.toBe<boolean>();
	expect(canColor(undefined)).type.toBe<boolean>();

	expect(canColor(stdout, true)).type.toBe<boolean>();
});
