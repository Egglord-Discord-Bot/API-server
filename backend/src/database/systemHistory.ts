import client from './client';

type createSystemHistory = {
	memoryUsage: string
	cpuUsage: number
}

export default class SystemHistoryManager {
	/**
		* Check if an image was sent with the request
		* @param {createSystemHistory} data The endpoint the user is trying to access
		* @returns Whether or not they are being ratelimited
	*/
	async create(data: createSystemHistory) {
		return client.systemHistory.create({
			data: {
				memoryUsage: data.memoryUsage,
				cpuUsage: data.cpuUsage,
			},
		});
	}

	/**
		* Check if an image was sent with the request
		* @returns Whether or not they are being ratelimited
	*/
	async fetchSystemHistoryData() {
		return client.systemHistory.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			take: 10,
		});
	}
}
