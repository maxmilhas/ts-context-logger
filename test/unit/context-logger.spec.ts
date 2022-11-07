import { Logger } from 'winston';
import { ContextInfoProvider, ContextLogger } from '../../src';

const proto = ContextLogger.prototype;

describe(ContextLogger.name, () => {
	let target: ContextLogger<any>;
	let logger: Logger;
	let contextProvider: ContextInfoProvider<any>;

	beforeEach(() => {
		logger = {} as any;
		contextProvider = {} as any;
		target = new ContextLogger(logger, contextProvider);
	});

	describe(proto.addMeta.name, () => {
		let meta: any;
		let getContextInfo: jest.SpyInstance;

		beforeEach(() => {
			getContextInfo = contextProvider.getContextInfo = jest
				.fn()
				.mockReturnValue(undefined);
			contextProvider.setContextInfo = jest
				.fn()
				.mockImplementation((v) => (meta = v));
		});

		it('should add meta creating new meta object, when none exists', () => {
			const result = target.addMeta('k1', 'v1');

			expect(result).toBeUndefined();
			expect(contextProvider.getContextInfo).toHaveCallsLike([]);
			expect(contextProvider.setContextInfo).toHaveCallsLike([meta]);
			expect(meta).toEqual({
				k1: 'v1',
			});
		});

		it('should add new meta property when a previous meta object exists', () => {
			(meta = {
				prev: 123,
			}),
				getContextInfo.mockReturnValue(meta);

			const result = target.addMeta('k1', 'v1');

			expect(result).toBeUndefined();
			expect(contextProvider.getContextInfo).toHaveCallsLike([]);
			expect(contextProvider.setContextInfo).toHaveCallsLike();
			expect(meta).toEqual({
				prev: 123,
				k1: 'v1',
			});
		});
	});

	describe(proto.log.name, () => {
		let spy: jest.SpyInstance;

		beforeEach(() => {
			spy = (logger as any).anyMethod = jest.fn();
			(contextProvider as any).correlationId = '789';
			contextProvider.getContextInfo = jest
				.fn()
				.mockReturnValue({ baseMeta: 456 });
		});

		it('should call the correspondent level method joining metadatas', () => {
			const result = target.log('anyMethod' as any, 'my msg', { meta: 123 });

			expect(result).toBeUndefined();
			expect(contextProvider.getContextInfo).toHaveCallsLike([]);
			expect(spy).toHaveCallsLike([
				'my msg',
				{
					meta: 123,
					baseMeta: 456,
					correlationId: '789',
				},
			]);
		});
	});

	describe(proto.debug.name, () => {
		beforeEach(() => {
			jest.spyOn(target, 'log').mockReturnValue(undefined);
		});
		it('should call log with debug level', () => {
			const result = target.debug('my msg', 'my meta');

			expect(result).toBeUndefined();
			expect(target.log).toHaveCallsLike(['debug', 'my msg', 'my meta']);
		});
	});

	describe(proto.info.name, () => {
		beforeEach(() => {
			jest.spyOn(target, 'log').mockReturnValue(undefined);
		});
		it('should call log with info level', () => {
			const result = target.info('my msg', 'my meta');

			expect(result).toBeUndefined();
			expect(target.log).toHaveCallsLike(['info', 'my msg', 'my meta']);
		});
	});

	describe(proto.error.name, () => {
		beforeEach(() => {
			jest.spyOn(target, 'log').mockReturnValue(undefined);
		});
		it('should call log with error level', () => {
			const result = target.error('my msg', 'my meta');

			expect(result).toBeUndefined();
			expect(target.log).toHaveCallsLike(['error', 'my msg', 'my meta']);
		});
	});

	describe(proto.warn.name, () => {
		beforeEach(() => {
			jest.spyOn(target, 'log').mockReturnValue(undefined);
		});
		it('should call log with warn level', () => {
			const result = target.warn('my msg', 'my meta');

			expect(result).toBeUndefined();
			expect(target.log).toHaveCallsLike(['warn', 'my msg', 'my meta']);
		});
	});
});
