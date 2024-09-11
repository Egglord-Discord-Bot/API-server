import client from './client';
import { Collection } from '../utils';
import { Notification } from '@prisma/client';
import { createNotificationData, endpointUserUnique } from 'src/types/database';

export default class NotificationManager {
	cache: Collection<number, Notification>;
	constructor() {
		this.cache = new Collection();
	}

	/**
		* Create an endpoint data
		* @param {createNotificationData} data The data for creating endpoint data
		* @returns The new endpoint data
	*/
	async create(data: createNotificationData) {
		// Check who the notification is for (if no user ID then assume all admins will get it)
		let userIds = [];
		if (data.userId == undefined) {
			const usersFromDb = await client.user.findMany({
				where: {
					role: 'ADMIN',
				},
			});
			userIds = usersFromDb.map(u => u.id);
		} else {
			userIds = [data.userId];
		}

		// Create the notifications
		for (const userId of userIds) {
			const notification = await client.notification.create({
				data: {
					content: data.content,
					header: data.header,
					user: {
						connect: {
							id: userId,
						},
					},
				},
			});
			this.cache.set(notification.id, notification);
			return true;
		}

		return false;
	}

	/**
		* Fetch all the notifications for a specific user
		* @param {bigint} data.userId The user
		* @returns Notifications for a user
	*/
	async fetchNotificationsByUserId(data: endpointUserUnique) {
		return client.notification.findMany({
			where: {
				userId: data.userId,
			},
		});
	}
}