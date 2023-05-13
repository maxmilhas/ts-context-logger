import { Logger } from 'winston';
import {
	BaseLogger,
	ContextInfoProvider,
	MetadataSetter,
	MetaValue,
	TypeFields,
	LogLevel,
} from './types';
import { BulkLogger } from './bulk-logger';
import { ContextLoggerOptions } from './types/context-logger-options';
import {
	asyncLocalStorageContextProvider,
	RequestContext,
} from './async-local-storage';

export class ContextLogger<TContextLoggerMeta extends object = any>
	implements BaseLogger<TContextLoggerMeta>, MetadataSetter<TContextLoggerMeta>
{
	private pendent = new WeakMap<Partial<TContextLoggerMeta>, boolean>();
	readonly bulk: BulkLogger;
	readonly availableLevels: LogLevel[];

	constructor(
		private logger: Logger,
		private contextProvider: ContextInfoProvider<TContextLoggerMeta> = asyncLocalStorageContextProvider,
		private options: ContextLoggerOptions = {},
	) {
		this.availableLevels = Object.keys(this.logger.levels) as LogLevel[];
		for (const level of this.availableLevels) {
			this[level] = (message, meta) => this.log(level, message, meta);
		}
		this.bulk = new BulkLogger(this, this.availableLevels);
		this.contextProvider.onContextEnd?.(() => {
			const pendentLog = this.options.pendentLog ?? {};
			this.log(
				pendentLog.level ?? LogLevel.info,
				pendentLog.message ?? 'Bulk messages',
				undefined,
				true,
			);
		});
	}

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
		this.pendent.set(meta, true);
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
		level: LogLevel,
		message: string,
		meta?: Partial<TContextLoggerMeta>,
		flush = false,
	) {
		const { obj, mergedMeta } = this.getMeta(meta);
		if (!flush || obj) {
			this.logger[level](message, mergedMeta);
			if (obj) {
				this.pendent.set(obj, false);
			}
		}
	}

	protected getMeta(meta: Partial<TContextLoggerMeta> | undefined) {
		const result: Record<string, unknown> = {
			routine: this.contextProvider.routine,
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
		return { obj, mergedMeta: Object.assign(result, meta) };
	}

	static setContext(routine: string, correlationId?: string) {
		return RequestContext.setContext(routine, correlationId);
	}
}
export interface ContextLogger<TContextLoggerMeta extends object = any>
	extends BaseLogger<TContextLoggerMeta> {}
