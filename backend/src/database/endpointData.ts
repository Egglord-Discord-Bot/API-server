import client from './client';
import type { Endpoint } from '@prisma/client';
import type { createEndpointData, updateEndpointData } from '../types/database';

export default class EndpointManager {
	size: Array<Endpoint>;
	constructor() {
		this.size = [];

		// Fetch total count on start up
		this.fetchEndpointData();
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
		if (this.size.length == 0) this.size = await client.endpoint.findMany();
		return this.size;
	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		return this.size.length;
	}
}
