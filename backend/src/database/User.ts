import { CONSTANTS } from '../utils';
import type { User } from '@prisma/client';
import type { updateUser, createUser, pagination, userUnqiueParam } from '../types/database';
import client from './client';

export default class UserManager {
	size: number;
	cachedUsers: Array<User>;
	constructor() {
		this.size = 0;
		this.cachedUsers = [];

		// Fetch total count on start up
		this.fetchCount();
	}

	/**
		* Creates a new user
		* @param {createUser} data The user class
		* @returns The new user
	*/
	async create(data: createUser) {
		this.size++;
		return client.user.create({
			data: {
				id: data.id,
				token: data.token,
				username: data.username,
				discriminator: data.discriminator,
				avatar: data.avatar,
				locale: data.locale,
				email: data.email,
			},
		});
	}

	/**
		* Delete an existing user
		* @param {number} id The ID of the user
		* @returns The deleted user
	*/
	async delete(id: number) {
		this.size--;
		return client.user.delete({
			where: { id },
		});
	}

	/**
		* Updated an existing user
		* @param {updateUser} data The data for updating user
		* @returns The new user
	*/
	async update(data: updateUser) {
		return client.user.update({
			where: {
				id: data.id,
			},
			data: {
				token: data.newToken != null ? data.newToken : undefined,
				isAdmin: data.isAdmin != null ? data.isAdmin : undefined,
				isBlocked: data.isBlocked != null ? data.isBlocked : undefined,
				isPremium: data.isPremium != null ? data.isPremium : undefined,
				username: data.username != null ? data.username : undefined,
				discriminator: data.discriminator != null ? data.discriminator : undefined,
				avatar: data.avatar != null ? data.avatar : undefined,
			},
		});
	}

	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchCount() {
		if (this.size == 0) this.size = await client.user.count();
		return this.size;
	}

	/**
		* Returns the total number of premium users
	*/
	async fetchPremiumCount() {
		return client.user.count({
			where: {
				isPremium: true,
			},
		});
	}
	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchAdminCount() {
		return client.user.count({
			where: {
				isAdmin: true,
			},
		});
	}
	/**
		* Returns the total number of entries
		* @returns The total number of entries
	*/
	async fetchBlockedCount() {
		return client.user.count({
			where: {
				isBlocked: true,
			},
		});
	}

	/**
    * Fetch a user based on their ID
    * @param {Param} id The ID of the user
    * @returns A user
  */
	async fetchByParam({ id, token }: userUnqiueParam) {
		return client.user.findUnique({
			where: { id, token },
		});
	}

	/**
		* Fetch a specific's user total history count
		* @param {number} month The userId for getting their user history count
		* @returns The total number of entries by a user
	*/
	async fetchUsersByMonth(month: number, year = new Date().getFullYear()) {
		return client.user.count({
			where: {
				createdAt: {
					gte: new Date(year, month, 1),
					lte: new Date(year, month + 1, 0),
				},
			},
		});
	}

	/**
		* Fetch a specific's user total history count
		* @param {string} name The userId for getting their user history count
		* @returns An array of users
	*/
	async fetchByUsername(name: string) {
		return client.user.findMany({
			where: {
				username: {
					startsWith: name,
				},
			},
		});
	}

	/**
    * Extract the user from the request (if any)
    * @param {pagination} page The ID of the user
    * @returns An array of users
  */
	async fetchUsers({ page, order = 'desc' }: pagination & { order?: 'desc' | 'asc' }) {
		return client.user.findMany({
			orderBy: {
				createdAt: order,
			},
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}
}
