import { Logger } from 'winston';
import { ContextInfoProvider } from './context-info-provider';

export class ContextLogger<TContextLoggerMeta extends object> {
	constructor(
		private logger: Logger,
		private contextProvider: ContextInfoProvider<TContextLoggerMeta>,
	) {}

	addMeta<TKey extends keyof TContextLoggerMeta>(
		key: TKey,
		value: TContextLoggerMeta[TKey],
	) {
		let meta = this.contextProvider.getContextInfo();
		if (!meta) {
			meta = {};
			this.contextProvider.setContextInfo(meta);
		}
		meta[key] = value;
	}

	log(
		level: 'info' | 'error' | 'warn' | 'debug',
		message: string,
		meta?: TContextLoggerMeta,
	) {
		this.logger[level](message, {
			correlationId: this.contextProvider.correlationId,
			...this.contextProvider.getContextInfo(),
			...meta,
		});
	}
	info(message: string, meta?: TContextLoggerMeta): void {
		this.log('info', message, meta);
	}

	error(message: string, meta?: TContextLoggerMeta): void {
		this.log('error', message, meta);
	}
	warn(message: string, meta?: TContextLoggerMeta): void {
		this.log('warn', message, meta);
	}
	debug(message: string, meta?: TContextLoggerMeta): void {
		this.log('debug', message, meta);
	}
}
