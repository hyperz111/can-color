# `has-color`

Detect whether a terminal supports color. The minimal fork of [chalk/supports-color](https://github.com/chalk/supports-color), with some differents.

1. ONLY supports `--[no-]-color` flag
2. JUST return boolean, no information about color supports level.
3. You MUST create the detector manually.

## Install

```sh
npm install has-color
```

## Usage

```js
import { hasColor } from "has-color";

if (hasColor(process.stdout)) {
	console.log("Terminal stdout supports color");
}
```

## API

### `hasColor(stream?, sniffFlags?)`

Return: `boolean`

Detect whether a terminal supports color.

#### `stream?`

Type: `WriteStream`

#### `sniffFlags?`

Type: `boolean`

## Info

It obeys the `--color` and `--no-color` CLI flags.

For situations where using `--color` is not possible, use the environment variable `FORCE_COLOR=1` (level 1), `FORCE_COLOR=2` (level 2), or `FORCE_COLOR=3` (level 3) to forcefully enable color, or `FORCE_COLOR=0` to forcefully disable. The use of `FORCE_COLOR` overrides all other color support checks.

## License

[MIT](https://opensource.org/license/mit/)
