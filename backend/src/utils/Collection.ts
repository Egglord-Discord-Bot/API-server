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

/**
 * A Map with additional utility methods.
 * @typeParam K - The key type this collection holds
 * @typeParam V - The value type this collection holds
*/
export class Collection<K, V> extends Map<K, V> {
	/**
	 * Searches for a single item where the given function returns a truthy value. This behaves lik
	 * @param fn - The function to test with (should return boolean)
	 * @param thisArg - Value to use as `this` when executing function
	*/
	public find(fn: (value: V, key: K, collection: this) => unknown, thisArg?: unknown): V | null {
		if (typeof fn !== 'function') throw new TypeError(`${fn} is not a function`);
		if (thisArg !== undefined) fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}

		return null;
	}

	/**
	 * Obtains unique random value(s) from this collection.
	 * @returns A single value
	*/
	public random(): V | undefined {
		const arr = [...this.values()];
		return arr[Math.floor(Math.random() * arr.length)];
	}
}
