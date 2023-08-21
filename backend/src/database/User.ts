import { CONSTANTS } from '../utils';
import type { User, Role } from '@prisma/client';
import type { updateUser, createUser, userUnqiueParam, fetchUsersParam } from '../types/database';
import client from './client';

interface ExtendedUser extends User {
	_count?: {
		history: number
	}
}

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
	async create(data: createUser): Promise<User> {
		this.size++;
		return client.user.create({
			data: {
				id: data.id,
				token: data.token,
				username: data.username,
				avatar: data.avatar,
				locale: data.locale,
				email: data.email,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
			},
		});
	}

	/**
		* Delete an existing user
		* @param {number} id The ID of the user
		* @returns The deleted user
	*/
	async delete(id: number): Promise<User> {
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
	async update(data: updateUser): Promise<User> {
		return client.user.update({
			where: {
				id: data.id,
			},
			data: {
				token: data.newToken != null ? data.newToken : undefined,
				role: data.role != null ? data.role : undefined,
				username: data.username != null ? data.username : undefined,
				avatar: data.avatar != null ? data.avatar : undefined,
				access_token: data.access_token != null ? data.access_token : undefined,
				refresh_token: data.refresh_token != null ? data.refresh_token : undefined,
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
		* Returns the total number of users who have a certain role
	*/
	async fetchCountByRole(role: Role) {
		return client.user.count({
			where: {
				role: role,
			},
		});
	}

	/**
    * Fetch a user based on their ID
    * @param {Param} id The ID of the user
    * @returns A user
  */
	async fetchByParam({ id, token }: userUnqiueParam): Promise<User| null> {
		return client.user.findUnique({
			where: { id, token },
		});
	}

	/**
		* Fetch the total number of users who joined in a certain year
		* @param {number} year The year to search in
		* @returns The number of users
	*/
	async fetchUserCountByYear(year = new Date().getFullYear()) {
		return client.user.count({
			where: {
				createdAt:{
					gte: new Date(year, 0),
					lte: new Date(year + 1, 0),
				},
			},
		});
	}

	/**
		* Fetch the total number of users who joined on a certain date
		* @param {number} day The day to search on
		* @param {number} month The month to search on
		* @param {number} year The year to search on
		* @returns The number of users
	*/
	async fetchUserCountByDate(day: number, month: number, year: number) {
		return client.user.count({
			where: {
				createdAt: {
					gte: new Date(year, month, day),
					lte: new Date(year, month, day + 1),
				},
			},
		});
	}

	/**
		* Fetch the total number of users who joined in a certain month
		* @param {number} month The month to search in
		* @param {number?} year The year to search in
		* @returns The number of users
	*/
	async fetchUserCountByMonth(month: number, year = new Date().getFullYear()) {
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
		* Fetch users based on their name
		* @param {string} name The name to search by
		* @param {boolean} includeHistory Whether or not to include their history count
		* @returns An array of users
	*/
	async fetchByUsername(name: string, includeHistory = true): Promise<ExtendedUser[]> {
		return this._removeToken(await client.user.findMany({
			where: {
				username: {
					startsWith: name,
				},
			},
			include: {
				_count: {
					select: { history: includeHistory },
				},
			},
		}));
	}

	/**
    * Fetch a list of the users based on the params
    * @param {fetchUsersParam} filters The filters to fetch users
    * @param {number} filters.page The page index
    * @param {string} filters.orderDir The direction of sort
    * @param {string} filters.orderType The property to sort by
    * @param {boolean} filters.includeHistory If the history count should be included
    * @returns An array of users
  */
	async fetchUsers({ page, orderDir = 'desc', orderType = 'joinedAt', includeHistory = true }: fetchUsersParam): Promise<ExtendedUser[]> {
		let users = [];
		if (orderType == 'requests') {
			users = await client.user.findMany({
				orderBy: {
					history: {
						_count: orderDir,
					},
				},
				skip: page * CONSTANTS.DbPerPage,
				take: CONSTANTS.DbPerPage,
				include: {
					_count: {
						select: { history: includeHistory },
					},
				},
			});
		} else {
			users = await client.user.findMany({
				orderBy: {
					createdAt: orderDir,
				},
				skip: page * CONSTANTS.DbPerPage,
				take: CONSTANTS.DbPerPage,
				include: {
					_count: {
						select: { history: includeHistory },
					},
				},
			});
		}

		// Remove the tokens and then return
		return this._removeToken(users);
	}

	/**
		* Fetch all users, mainly just for downloading
		* @returns An array of users
	*/
	async fetchAll(removeToken = false): Promise<ExtendedUser[]> {
		const users = await client.user.findMany();
		return (removeToken) ? this._removeToken(users) : users;
	}

	/**
		* Strip the token from the users
		* @param {Array<User>} users The array of users
		* @returns An array of users
	*/
	private _removeToken(users: Array<ExtendedUser>): ExtendedUser[] {
		return users.map(u => ({ ...u, token: '' }));
	}
}
