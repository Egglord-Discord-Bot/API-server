import { CONSTANTS } from '../utils';
import type { UserHistoryCreateParam, endpointUserUnique, pagination, fetchHistoryParam } from '../types/database';
import type { UserHistory } from '@prisma/client';
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
		return client.userHistory.create({
			data: {
				endpoint: {
					connectOrCreate: {
						where: {
							name: data.endpoint,
						},
						create: {
							name: data.endpoint,
						},
					},
				},
				responseCode: {
					connectOrCreate: {
						where: {
							code: data.responseCode,
						},
						create: {
							code: data.responseCode,
						},
					},
				},
				responseTime: data.responseTime,
				user: data.id == null ? undefined : {
					connect: { id: data.id },
				},
			},
		});
	}

	/**
		* Deletes an existing endpoint history
		* @param {number} id The id of the endpoint
		* @returns The deleted endpoint history
	*/
	async delete(id: number): Promise<UserHistory> {
		this.size--;
		return client.userHistory.delete({
			where: { id },
		});
	}

	/**
		* Fetch all the times the user accessed the endpoint
		* @param {bigint} data.id The user
		* @param {string} data.endpoint The endpoint
		* @param {number} data.page The endpoint
		* @returns Record of user used the endpoint
	*/
	async fetchEndpointUsagePerUser({ id: userId, endpoint, page }: UserHistoryCreateParam & pagination): Promise<UserHistory[]> {
		return client.userHistory.findMany({
			where: {
				endpointName: endpoint, userId,
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Fetch a specific user's history
		* @param {bigint} data.userId The userId for getting their user history
		* @param {number} data.page The endpoint
		* @returns Array if user history entries based on userId
	*/
	async fetchEndpointUsagesPerUser({ userId, page }: endpointUserUnique & pagination): Promise<UserHistory[]> {
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
		* @param {pagination} data.page The page number to fetch
		* @returns Array of user history entries
	*/
	async fetchAllEndpointUsage({ page }: pagination): Promise<UserHistory[]> {
		return client.userHistory.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}

	/**
		* Fetch a specific's user total history count
		* @param {bigint} userId The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchEndpointCountByUser(userId: bigint) {
		const l: { [key: string]: number } = {};
		const responseCodes = await client.userHistory.groupBy({
			by: ['endpointName'],
			where: {
				userId: userId,
			},
		});

		for (const [, { endpointName }] of Object.entries(responseCodes)) {
			l[endpointName ?? ''] = await client.userHistory.count({
				where: {
					endpointName: endpointName,
					userId: userId,
				},
			});
		}
		return l;
	}

	/**
		* Fetch the total number of requests that were made in a certain year
		* @param {number} year The year to search in
		* @returns The number of users
	*/
	async fetchHistoryCountByYear(year = new Date().getFullYear()) {
		return client.userHistory.count({
			where: {
				createdAt:{
					gte: new Date(year, 0),
					lte: new Date(year + 1, 0),
				},
			},
		});
	}

	/**
		* Fetch a specific's user total history count
		* @param {number} month The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchHistoryCountByMonth(month: number, year = new Date().getFullYear()) {
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
		* Fetch the total number of requests that were made on a certain date
		* @param {number} day The day to search on
		* @param {number} month The month to search on
		* @param {number} year The year to search on
		* @returns The number of users
	*/
	async fetchHistoryCountByDate(day: number, month: number, year: number) {
		return client.userHistory.count({
			where: {
				createdAt: {
					gte: new Date(year, month, day),
					lte: new Date(year, month, day + 1),
				},
			},
		});
	}

	/**
		* Fetch the total number of requests that were made on a certain date
		* @param {number} hour The hour to search on
		* @param {number} day The day to search on
		* @param {number} month The month to search on
		* @param {number} year The year to search on
		* @returns The number of users
	*/
	async fetchHistoryCountByHour(hour: number, day = new Date().getDate(), month = new Date().getMonth(), year = new Date().getFullYear()) {
		return client.userHistory.count({
			where: {
				createdAt: {
					gte: new Date(year, month, day, hour),
					lte: new Date(year, month, day, hour + 1),
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
		* @param {string} name The name of the endpoint
		* @returns The total number of entries by a user
	*/
	async fetchHistoryByName(name: string): Promise<UserHistory[]> {
		return client.userHistory.findMany({
			where: {
				endpointName: {
					startsWith: name,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
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

	/**
		* Fetch a list of the userHistory based on the params
		* @param {fetchUsersParam} filters The filters to fetch users
		* @param {number} filters.page The page index
		* @param {string} filters.orderDir The direction of sort
		* @param {string} filters.orderType The property to sort by
		* @returns An array of userHistory
	*/
	async fetchHistory({ page, orderDir = 'desc', orderType = 'accessedAt' }: fetchHistoryParam): Promise<UserHistory[]> {
		let history = [];
		if (orderType == 'statusCode') {
			history = await client.userHistory.findMany({
				orderBy: {
					statusCode: orderDir,
				},
				skip: page * CONSTANTS.DbPerPage,
				take: CONSTANTS.DbPerPage,
			});
		} else {
			history = await client.userHistory.findMany({
				orderBy: {
					createdAt: orderDir,
				},
				skip: page * CONSTANTS.DbPerPage,
				take: CONSTANTS.DbPerPage,
			});
		}
		return history;
	}

	async fetchAll(): Promise<UserHistory[]> {
		return client.userHistory.findMany();
	}
}
