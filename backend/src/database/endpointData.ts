import client from './client';
import type { Endpoint } from '@prisma/client';
import type { createEndpointData, updateEndpointData } from '../types/database';

export default class EndpointManager {
	cache: Array<Endpoint>;
	constructor() {
		this.cache = [];

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
		const endpoint = await client.endpoint.update({
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
		// Update cache aswell
		await this.fetchEndpointData(true);
		return endpoint;
	}

	/**
		* Delete an endpoint from the databasee
		* @param {string} name The name of endpoint
		* @returns The old endpoint data
	*/
	async delete(name: string) {
		return client.endpoint.delete({
			where: {
				name,
			},
		});
	}
	/**
		* Fetch an array of endpoint data entries
		* @param {?boolean} force Ignore cache and force fetch from database
		* @returns An array of endpoint data entries
	*/
	async fetchEndpointData(force?: boolean) {
		if (this.cache.length == 0 || force) this.cache = await client.endpoint.findMany();
		return this.cache;
	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		return this.cache.length;
	}
}
