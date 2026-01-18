import {stdout, stderr} from 'node:process';
import {expectType} from 'tsd';
import {canColor} from './index.js';

expectType<boolean>(canColor(stdout));
expectType<boolean>(canColor(stderr));
expectType<boolean>(canColor(undefined));

expectType<boolean>(canColor(stdout, true));
