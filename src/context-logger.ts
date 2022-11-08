import { Logger } from 'winston';
import { ContextInfoProvider } from './context-info-provider';

type NumericFields<T extends object> = NonNullable<
	{
		[K in keyof T]: T[K] extends number ? K : never;
	}[keyof T]
>;

export class ContextLogger<TContextLoggerMeta extends object = any> {
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

	incMeta<TKey extends NumericFields<TContextLoggerMeta>>(
		key: TKey,
		value: number = 1,
	) {
		const previous =
			(this.contextProvider.getContextInfo()?.[key] as unknown as number) ?? 0;
		const result = previous + value;

		this.addMeta(key, result as unknown as TContextLoggerMeta[TKey]);

		return result;
	}

	log(
		level: 'info' | 'error' | 'warn' | 'debug',
		message: string,
		meta?: Partial<TContextLoggerMeta>,
	) {
		this.logger[level](message, {
			correlationId: this.contextProvider.correlationId,
			...this.contextProvider.getContextInfo(),
			...meta,
		});
	}
	info(message: string, meta?: Partial<TContextLoggerMeta>): void {
		this.log('info', message, meta);
	}

	error(message: string, meta?: Partial<TContextLoggerMeta>): void {
		this.log('error', message, meta);
	}
	warn(message: string, meta?: Partial<TContextLoggerMeta>): void {
		this.log('warn', message, meta);
	}
	debug(message: string, meta?: Partial<TContextLoggerMeta>): void {
		this.log('debug', message, meta);
	}
}
