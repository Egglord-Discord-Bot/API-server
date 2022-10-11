import client from './client';

export async function fetchEndpointData() {
	return client.endpoint.findMany({});
}

type createEndpointData = {
  name: string
  cooldown?: number
  maxRequests?: number
  maxRequestper?: number
}

export async function createEndpointData(data: createEndpointData) {
	return client.endpoint.create({
		data: {
			name: data.name,
			cooldown: data.cooldown,
			maxRequests: data.maxRequests,
			maxRequestper: data.maxRequestper,
		},
	});
}
