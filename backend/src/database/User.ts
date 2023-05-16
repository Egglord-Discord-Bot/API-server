import { CONSTANTS } from '../utils/CONSTANTS';
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
    * Fetch a user based on their ID
    * @param {Param} id The ID of the user
    * @returns A user
  */
	async fetchByParam({ id, token }: userUnqiueParam) {
		return client.user.findUnique({
			where: { id: id, token: token },
		});
	}

	/**
    * Extract the user from the request (if any)
    * @param {pagination} page The ID of the user
    * @returns An array of users
  */
	async fetchUsers({ page }: pagination) {
		return client.user.findMany({
			skip: page * CONSTANTS.DbPerPage,
			take: CONSTANTS.DbPerPage,
		});
	}
}
