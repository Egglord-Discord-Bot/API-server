import client from './client';
import type { ResponseCode } from '@prisma/client';

export default class ResponseCodeManager {

	async create(data: ResponseCode) {
		return client.responseCode.create({
			data: {
				code: data.code,
			},
		});
	}

	/**
		* Fetch counts of all entries based on response code
		* @returns Object of responseCode and total count
	*/
	async fetchResponseCodeCounts() {
		return client.responseCode.findMany({
			include: {
				_count: {
					select: {
						history: true,
					},
				},
			},
		});
	}
}
