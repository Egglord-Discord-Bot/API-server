import client from './client';
import type { createEndpointData, updateEndpointData } from '../types/database';

export default class EndpointManager {
	size: number;
	constructor() {
		this.size = 0;

		this.fetchCount();
	}

	/**
		* Create an endpoint data
		* @param {createEndpointData} data The data for creating endpoint data
		* @returns The new endpoint data
	*/
	async create(data: createEndpointData) {
		return client.endpoint.create({
			data: {
				name: data.name,
				cooldown: data.cooldown,
				maxRequests: data.maxRequests,
				maxRequestper: data.maxRequestper,
				premiumOnly: data.premiumOnly,
			},
		});
	}

	/**
		* Updated an existing endpoint data entry
		* @param {updateUser} data The data for updating the endpoint data
		* @returns The new endpoint data
	*/
	async update(data: updateEndpointData) {
		return client.endpoint.update({
			where: {
				name: data.name,
			},
			data: {
				cooldown: data.cooldown != null ? data.cooldown : undefined,
				maxRequests: data.maxRequests != null ? data.maxRequests : undefined,
				maxRequestper: data.maxRequestper != null ? data.maxRequestper : undefined,
				isBlocked: data.isBlocked != null ? data.isBlocked : undefined,
				premiumOnly: data.premiumOnly != null ? data.premiumOnly : undefined,
			},
		});
	}

	/**
		* Fetch an array of endpoint data entries
		* @returns An array of endpoint data entries
	*/
	async fetchEndpointData() {
		return client.endpoint.findMany();
	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		if (this.size == 0) this.size = await client.endpoint.count();
		return this.size;
	}
}
