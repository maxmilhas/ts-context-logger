export enum LogLevel {
	info = 'info',
	error = 'error',
	warn = 'warn',
	debug = 'debug',
}

export const LevelRank: Record<string, number> = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
};
