import { LogLevel } from './types';

export function* getLogLevels(): Iterable<LogLevel> {
	for (const key in LogLevel) {
		if (LogLevel.hasOwnProperty(key)) {
			yield LogLevel[key as keyof typeof LogLevel];
		}
	}
}
