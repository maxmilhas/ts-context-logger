import { BulkLogger, LogLevel, MetadataSetter } from '../../src';

describe(BulkLogger.name, () => {
	const levels = Object.values(LogLevel);
	let target: BulkLogger;
	let setter: MetadataSetter<any>;

	beforeEach(() => {
		setter = {} as any;
		target = new BulkLogger(setter, levels);
	});

	for (const level of levels) {
		describe(level, () => {
			beforeEach(() => {
				setter.incTextMeta = jest.fn();
				setter.addMetas = jest.fn();
			});

			it(`should add a ${level} log to bulk`, () => {
				const metaInfo = { myMeta: 123 };

				target[level]('my message', metaInfo);

				expect(setter.incTextMeta).toHaveCallsLike([
					'bulkMessages',
					`${level}: my message`,
				]);
				expect(setter.addMetas).toHaveCallsLike([metaInfo]);
			});
		});
	}
});
