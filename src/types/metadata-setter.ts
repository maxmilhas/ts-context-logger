export type TypeFields<T extends object, DesiredType> = NonNullable<
	{
		[K in keyof T]: T[K] extends DesiredType ? K : never;
	}[keyof T]
>;
export type FuncType<T> = () => MetaValue<T>;
export type MetaValue<T> = T | FuncType<T>;
export type StringField<TMetadata extends object> = TypeFields<
	TMetadata,
	string[]
>;
export type NumberField<TMetadata extends object> = TypeFields<
	TMetadata,
	number
>;
export type MetaNumberField<TMetadata extends object> = TypeFields<
	TMetadata,
	MetaValue<number>
>;

export interface MetadataSetter<TMetadata extends object> {
	addMeta<TKey extends keyof TMetadata>(
		key: TKey,
		value: MetaValue<TMetadata[TKey]>,
		expiringCount?: number,
	): void;
	addMetas(metas: Partial<TMetadata>, expiringCount?: number): void;
	removeMeta(key: keyof TMetadata): void;
	incMeta<TKey extends NumberField<TMetadata>>(key: TKey, value?: number): void;
	incTextMeta<TKey extends StringField<TMetadata>>(
		key: TKey,
		newLine: string,
	): void;
	addDurationMeta<TKey extends MetaNumberField<TMetadata>>(
		key: TKey,
		expiringCount?: number,
	): void;
}
