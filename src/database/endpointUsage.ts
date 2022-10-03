import client from './client';

type userID = {
	id: string
	endpoint: string
}

// Create a user with token
export async function createEndpoint(data: userID) {
	return client.endpointUsage.create({
		data: {
			endpoint: data.endpoint,
			user: {
				connect: {
					id: data.id,
				},
			},
		},
	});
}

type getBasedOnEndpoint = {
	endpoint: string
	id: string
}

export async function fetchEndpointUsagePerUser(data: getBasedOnEndpoint) {
	return client.endpointUsage.findMany({
		where: {
			endpoint: data.endpoint,
			userId: data.id,
		},
	});
}

type fetchEndpointUsagesPerUser = {
	id: string
}

export async function fetchEndpointUsagesPerUser(data: fetchEndpointUsagesPerUser) {
	return client.endpointUsage.findMany({
		where: {
			userId: data.id,
		},
	});
}
