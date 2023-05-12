import client from './client';

export async function fetchSystemHistoryData() {
	return client.systemHistory.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		take: 10,
	});
}

type createSystemHistory = {
  memoryUsage: string
  cpuUsage: number
}

export async function createSystemHistory(data: createSystemHistory) {
	return client.systemHistory.create({
		data: {
			memoryUsage: data.memoryUsage,
			cpuUsage: data.cpuUsage,
		},
	});
}
