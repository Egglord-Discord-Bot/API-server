import { CONSTANTS } from '../utils/CONSTANTS';
import type { UserHistoryCreateParam, endpointUserUnique, pagination } from '../types/database';
import client from './client';

export default class userHistoryManager {
	size: number;
	constructor() {
		this.size = 0;

		// Fetch total count on start up
		this.fetchCount();
	}

	/**
		* Creates a new endpoint entry
		* @param {endpointUserParam} data The endpoint data
		* @returns The new endpoint history
	*/
	async create(data: UserHistoryCreateParam) {
		this.size++;
		if (data.id == null) {
			return client.userHistory.create({
				data: {
					endpoint: data.endpoint,
					responseCode: data.responseCode,
					responseTime: data.responseTime,
				},
			});
		} else {
			return client.userHistory.create({
				data: {
					endpoint: data.endpoint,
					responseCode: data.responseCode,
					responseTime: data.responseTime,
					user: {
						connect: { id: data.id 	},
					},
				},
			});
		}
	}

	/**
		* Deletes an existing endpoint history
		* @param {number} id The id of the endpoint
		* @returns The deleted endpoint history
	*/
	async delete(id: number) {
		this.size--;
		return client.userHistory.delete({
			where: { id },
		});
	}

	/**
		* Fetch all the times the user accessed the endpoint
		* @param {string} data.id The user
		* @param {string} data.endpoint The endpoint
		* @returns Record of user used the endpoint
	*/
	async fetchEndpointUsagePerUser({ id: userId, endpoint, page }: UserHistoryCreateParam & pagination) {
		return client.userHistory.findMany({
			where: {
				endpoint, userId,
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Fetch a specific user's history
		* @param {number} userId The userId for getting their user history
		* @returns Array if user history entries based on userId
	*/
	async fetchEndpointUsagesPerUser({ userId, page }: endpointUserUnique & pagination) {
		return client.userHistory.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			where: {
				userId,
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Fetch all history
		* @param {pagination} page The page number to fetch
		* @returns Array of user history entries
	*/
	async fetchAllEndpointUsage({ page }: pagination) {
		return client.userHistory.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Fetch all history that has name that starts with the param
		* @param {string} name The name for searching
		* @returns Array of user history entries
	*/
	async fetchEndpointByName(name: string) {
		return client.userHistory.findMany({
			where: {
				endpoint: {
					startsWith: name,
				},
			},
		});
	}

	/**
		* Fetch counts of all entries based on response code
		* @returns Object of responseCode and total count
	*/
	async fetchResponseCodeCounts() {
		const l: { [key: string]: number } = {};
		const responseCodes = await client.userHistory.groupBy({
			by: ['responseCode'],
		});

		for (const [, code] of Object.entries(responseCodes)) {
			l[code.responseCode] = await client.userHistory.count({
				where: {
					responseCode: code.responseCode,
				},
			});
		}
		return l;
	}

	/**
		* Fetch a specific's user total history count
		* @param {bigint} userId The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchEndpointCountByUser(userId: bigint) {
		const l: { [key: string]: number } = {};
		const responseCodes = await client.userHistory.groupBy({
			by: ['endpoint'],
			where: {
				userId: userId,
			},
		});

		for (const [, code] of Object.entries(responseCodes)) {
			l[code.endpoint] = await client.userHistory.count({
				where: {
					endpoint: code.endpoint,
					userId: userId,
				},
			});
		}
		return l;
	}

	/**
		* Fetch a specific's user total history count
		* @param {number} month The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchEndpointsByMonth(month: number, year = new Date().getFullYear()) {
		return client.userHistory.count({
			where: {
				createdAt: {
					gte: new Date(year, month, 1),
					lte: new Date(year, month + 1, 0),
				},
			},
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

	/**
		* Fetch a specific's user total history count
		* @param {bigint} userId The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchCountByUserId(userId: bigint) {
		return client.userHistory.count({
			where: {
				userId: userId,
			},
		});
	}
}
