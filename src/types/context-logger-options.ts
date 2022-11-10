import { LogLevel } from './log-level';

export interface ContextLoggerOptions {
	pendentLog?: {
		level?: LogLevel;
		message?: string;
	};
}
