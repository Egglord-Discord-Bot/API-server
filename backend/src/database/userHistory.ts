import { CONSTANTS } from '../utils/CONSTANTS';
import type { endpointUserParam } from '../types/database';
import client from './client';

export default class userHistoryManager {
	size: number;
	constructor() {
		this.size = 0;

		this.fetchCount();
	}

	/**
		* Creates a new endpoint entry
		* @param {endpointUserParam} data The endpoint data
		* @returns The new endpoint history
	*/
	async create({ id, endpoint }: endpointUserParam) {
		this.size++;
		return client.userHistory.create({
			data: {
				endpoint: endpoint,
				user: {
					connect: {
						id: id,
					},
				},
			},
		});
	}

	/**
		* Deletes an existing endpoint history
		* @param {number} id The id of the endpoint
		* @returns The deleted endpoint history
	*/
	async delete(id: number) {
		this.size--;
		return client.userHistory.delete({
			where: {
				id,
			},
		});
	}

	/**
		* Fetch all the times the user accessed the endpoint
		* @param {string} data.id The user
		* @param {string} data.endpoint The endpoint
		* @returns Record of user used the endpoint
	*/
	async fetchEndpointUsagePerUser({ id: userId, endpoint }: endpointUserParam) {
		return client.userHistory.findMany({
			where: {
				endpoint, userId,
			},
		});
	}

	/**
		* Check if an image was sent with the request
		* @param {number} userId The endpoint the user is trying to access
		* @returns Whether or not they are being ratelimited
	*/
	async fetchEndpointUsagesPerUser(userId: number) {
		return client.userHistory.findMany({
			where: {
				userId,
			},
		});
	}

	async fetchAllEndpointUsage(page: number) {
		return client.userHistory.findMany({
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		if (this.size == 0) this.size = await client.userHistory.count();
		return this.size;
	}
}
