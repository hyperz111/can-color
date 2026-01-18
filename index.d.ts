import type {WriteStream} from 'node:tty';

export function canColor(stream?: WriteStream, sniffFlags?: boolean): boolean;
