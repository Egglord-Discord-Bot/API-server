import client from './client';
import type { userID } from '../utils/types'

/**
	* Create a record of user accessing the endpoint
	* @param {string} data.id The endpoint the user is trying to access
	* @param {string} data.endpoint The endpoint the user is trying to access
	* @returns Record of user used the endpoint
*/
export async function createEndpoint({id, endpoint}: userID) {
	return client.endpointUsage.create({
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
	* Fetch all the times the user accessed the endpoint
	* @param {string} data.id The user
	* @param {string} data.endpoint The endpoint
	* @returns Record of user used the endpoint
*/
export async function fetchEndpointUsagePerUser({id, endpoint}: userID) {
	return client.endpointUsage.findMany({
		where: {
			endpoint: endpoint,
			userId: id,
		},
	});
}

/**
	* Check if an image was sent with the request
	* @param data The endpoint the user is trying to access
	* @returns Whether or not they are being ratelimited
*/
export async function fetchEndpointUsagesPerUser(id: string) {
	return client.endpointUsage.findMany({
		where: {
			userId: id,
		},
	});
}
