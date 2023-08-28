import client from './client';
import type { createEndpointData, updateEndpointData, ExtendedEndpoint } from '../types/database';
import { Collection } from '../utils';

export default class EndpointManager {
	cache: Collection<string, ExtendedEndpoint>;
	constructor() {
		this.cache = new Collection();

		// Fetch total count on start up
		this.fetchEndpoints();
	}

	/**
		* Create an endpoint data
		* @param {Endpoint} data The data for creating endpoint data
		* @returns The new endpoint data
	*/
	async create(data: createEndpointData) {
		const endpoint = await client.endpoint.create({
			data: {
				name: data.name,
				cooldown: data.cooldown,
				maxRequests: data.maxRequests,
				maxRequestper: data.maxRequestper,
				premiumOnly: data.premiumOnly,
				isValid: data.isValid == undefined ? false : data.isValid,
			},
		});
		this.cache.set(endpoint.name, endpoint);
		return endpoint;
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
				isValid: data.isValid != null ? data.isValid : undefined,
			},
		});
		this.cache.set(endpoint.name, endpoint);
		return endpoint;
	}

	/**
		* Delete an endpoint from the databasee
		* @param {string} name The name of endpoint
		* @returns The old endpoint data
	*/
	async delete(name: string) {
		this.cache.delete(name);
		return client.endpoint.delete({
			where: { name },
		});
	}

	/**
		* Fetch an array of endpoint data entries
		* @param {?boolean} force Ignore cache and force fetch from database
		* @param {?boolean} includeHistory Include the history with the request
		* @returns An array of endpoint data entries
	*/
	async fetchEndpoints(force?: boolean, includeHistory?: boolean): Promise<Collection<string, ExtendedEndpoint>> {
		if (this.cache.size == 0 || force) {
			const endpoints = await client.endpoint.findMany({
				include: {
					_count: !includeHistory ? false : {
						select: {
							history: includeHistory,
						},
					},
				},
			});
			endpoints.forEach(e => this.cache.set(e.name, e));
		}
		return this.cache;
	}

	/**
		* Fetch all history that has name that starts with the param
		* @param {string} name The name for searching
		* @param {?boolean} includeHistory Include the history with the request
		* @returns Array of user history entries
	*/
	async fetchEndpointByName(name: string, includeHistory?: boolean) {
		// Check cache first
		let endpoints = [];
		for (const endpointName of this.cache.keys()) {
			if (endpointName.startsWith(name)) endpoints.push(this.cache.get(endpointName));
		}

		if (endpoints.length == 0) {
			endpoints = await client.endpoint.findMany({
				where: {
					name: {
						startsWith: name,
					},
				},
				include: {
					_count: {
						select: {
							history: includeHistory ?? false,
						},
					},
				},
			});
		}
		return endpoints;
	}

	async fetchMostAccessEndpoints() {
		return client.endpoint.findMany({
			include: {
				_count: {
					select: {
						history: true,
					},
				},
			},
		});

	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		return this.cache.size;
	}
}
