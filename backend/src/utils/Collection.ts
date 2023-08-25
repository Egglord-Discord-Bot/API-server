export interface CollectionConstructor {
	new (): Collection<unknown, unknown>;
	new <K, V>(entries?: readonly (readonly [K, V])[] | null): Collection<K, V>;
	new <K, V>(iterable: Iterable<readonly [K, V]>): Collection<K, V>;
	readonly prototype: Collection<unknown, unknown>;
	readonly [Symbol.species]: CollectionConstructor;
}

export interface Collection<K, V> extends Map<K, V> {
  constructor: CollectionConstructor;
}

export class Collection<K, V> extends Map<K, V> {
	public find(fn: (value: V, key: K, collection: this) => unknown, thisArg?: unknown): V | null {
		if (typeof fn !== 'function') throw new TypeError(`${fn} is not a function`);
		if (thisArg !== undefined) fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}

		return null;
	}
}
