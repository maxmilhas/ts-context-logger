import { getLogLevels } from './get-log-levels';
import { BaseLogger, MetadataSetter, StringField } from './types';

export class BulkLogger<T extends object = any> implements BaseLogger<T> {
	constructor(private setter: MetadataSetter<T>) {
		for (const level of getLogLevels()) {
			this[level] = (message, meta) => {
				this.setter.incTextMeta(
					'bulkMessages' as unknown as StringField<T>,
					`${level}: ${message}`,
				);
				if (meta) {
					this.setter.addMetas(meta);
				}
			};
		}
	}
}
export interface BulkLogger<T extends object = any> extends BaseLogger<T> {}
