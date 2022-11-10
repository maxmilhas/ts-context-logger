import { LogLevel } from './log-level';

export interface BaseLogger<T extends object = any> {
	[LogLevel.info](message: string, meta?: Partial<T>): void;
	[LogLevel.error](message: string, meta?: Partial<T>): void;
	[LogLevel.warn](message: string, meta?: Partial<T>): void;
	[LogLevel.debug](message: string, meta?: Partial<T>): void;
}
