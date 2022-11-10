export interface ContextInfoProvider<T extends object> {
	readonly correlationId: string;
	getContextInfo(): Partial<T> | undefined;
	setContextInfo(value: Partial<T>): void;
}
