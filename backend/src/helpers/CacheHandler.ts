type addData = {
	id: string
	data: object
}

export default class CacheHandler {
	timetillSweep: number;
	data: Map<string, object>;
	constructor() {
		// 6 hours
		this.timetillSweep = 21_600_000;
		this.data = new Map();
	}

	/**
	 * Sweep the cache
	 * @param {string} dataId The map id of the data to delete
	 * @param {number} [time] How long it should stay in cache for.
	*/
	_sweep(dataId: string, time?: number) {
		setTimeout(() => {
			this.data.delete(dataId);
		}, time ?? this.timetillSweep);
	}

	/**
	 * Sweep the cache
	 * @param {object} data
	 * @param {string} data.id The id of the data that will be stored
	 * @param {object} data.data The actual data being stored
	 * @param {number} [time] How long it should stay in cache for.
	*/
	_addData({ id, data }: addData, time?: number) {
		this.data.set(id, data);
		this._sweep(id, time);
	}
}
