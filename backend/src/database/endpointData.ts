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

type updateEndpointData = {
	name: string
  cooldown?: number
  maxRequests?: number
  maxRequestper?: number
  isBlocked?: boolean
}
export async function updateEndpointData(data: updateEndpointData) {
	return client.endpoint.update({
		where: {
			name: data.name,
		},
		data: {
			cooldown: data.cooldown != null ? data.cooldown : undefined,
			maxRequests: data.maxRequests != null ? data.maxRequests : undefined,
			maxRequestper: data.maxRequestper != null ? data.maxRequestper : undefined,
			isBlocked: data.isBlocked != null ? data.isBlocked : undefined,
		},
	});
}
