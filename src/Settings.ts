import type { cache } from './types';

export default class Settings {
	data: Map<any, any>;
	constructor() {
		this.data = new Map();
	}

	get<K extends keyof cache>(key: K): cache[K];

	get(key: keyof cache) {
		return this.data.get(key);
	}
	async set(key: keyof cache, value: cache[keyof cache]) {
		this.data.set(key, value);
	}
}
