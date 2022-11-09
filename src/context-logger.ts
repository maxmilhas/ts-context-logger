import { Logger } from 'winston';
import { ContextInfoProvider } from './context-info-provider';

export type TypeFields<T extends object, DesiredType> = NonNullable<
	{
		[K in keyof T]: T[K] extends DesiredType ? K : never;
	}[keyof T]
>;
export type FuncType<T> = () => MetaValue<T>;
export type MetaValue<T> = T | FuncType<T>;

export class ContextLogger<TContextLoggerMeta extends object = any> {
	constructor(
		private logger: Logger,
		private contextProvider: ContextInfoProvider<TContextLoggerMeta>,
	) {}

	addMeta<TKey extends keyof TContextLoggerMeta>(
		key: TKey,
		value: MetaValue<TContextLoggerMeta[TKey]>,
		expiringCount = 0,
	) {
		let meta = this.contextProvider.getContextInfo();
		if (!meta) {
			meta = {};
			this.contextProvider.setContextInfo(meta);
		}
		meta[key] = (
			expiringCount === 0
				? value
				: () => {
						const result = value;
						expiringCount--;
						if (expiringCount <= 0) {
							this.removeMeta(key);
						}
						return result;
				  }
		) as TContextLoggerMeta[TKey];
	}

	addMetas(metas: Partial<TContextLoggerMeta>, expiringCount = 0) {
		for (const p in metas) {
			if (metas.hasOwnProperty(p)) {
				this.addMeta(
					p,
					metas[p] as TContextLoggerMeta[typeof p],
					expiringCount,
				);
			}
		}
	}

	removeMeta(key: keyof TContextLoggerMeta) {
		delete this.contextProvider.getContextInfo()?.[key];
	}

	incMeta<TKey extends TypeFields<TContextLoggerMeta, number>>(
		key: TKey,
		value: number = 1,
	) {
		const previous =
			(this.contextProvider.getContextInfo()?.[key] as unknown as number) ?? 0;
		const result = previous + value;

		this.addMeta(key, result as unknown as TContextLoggerMeta[TKey]);

		return result;
	}

	incTextMeta<TKey extends TypeFields<TContextLoggerMeta, string[]>>(
		key: TKey,
		newLine: string,
	) {
		const lines =
			(this.contextProvider.getContextInfo()?.[key] as unknown as string[]) ??
			[];
		lines.push(newLine);
		this.addMeta(key, lines as unknown as TContextLoggerMeta[TKey]);
	}

	addDurationMeta<
		TKey extends TypeFields<TContextLoggerMeta, MetaValue<number>>,
	>(key: TKey, expiringCount = 0) {
		const start = Date.now();
		this.addMeta(
			key,
			() => (Date.now() - start) as unknown as TContextLoggerMeta[TKey],
			expiringCount,
		);
	}

	log(
		level: 'info' | 'error' | 'warn' | 'debug',
		message: string,
		meta?: Partial<TContextLoggerMeta>,
	) {
		this.logger[level](message, this.getMeta(meta));
	}

	protected getMeta(meta: Partial<TContextLoggerMeta> | undefined) {
		const result: Record<string, unknown> = {
			correlationId: this.contextProvider.correlationId,
		};
		const obj = this.contextProvider.getContextInfo();
		for (const prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				let value = obj[prop];
				while (typeof value === 'function') {
					value = value();
				}
				result[prop] = value;
			}
		}
		return Object.assign(result, meta);
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
