export interface ContextInfoProvider<T extends object> {
	readonly routine: string;
	readonly correlationId: string;
	getContextInfo(): Partial<T> | undefined;
	setContextInfo(value: Partial<T>): void;
	onContextEnd?(callback: (routine?: string) => void): void;
}
