import client from './client';

// Fetch a user
export async function fetchUser(id: bigint) {
	return client.user.findUnique({
		where: {
			id: id,
		},
	});
}

type fetchUsers = {
	page: number
}
export async function fetchUsers({ page }: fetchUsers) {
	return client.user.findMany({
		skip: page * 10,
		take: 10,
	});
}


export async function fetchUserCount() {
	return client.user.count();
}

type createUser = {
	id: bigint
	token: string
	username?: string
	discriminator?: string
	avatar?: string
	locale?: string
	email?: string
}

// Create a user with token
export async function createUser(data: createUser) {
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

// Delete a user
export async function deleteUser(id: number) {
	return client.user.delete({
		where: {
			id: id,
		},
	});
}

type updateUser = {
	id: number
	newToken?: string
	username?: string
	discriminator?: string
	isAdmin?: boolean
	isBlocked?: boolean
	isPremium?: boolean
}

// Update a user
export async function updateUser(data: updateUser) {
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
		},
	});
}


export async function fetchUserByToken(token: string) {
	return client.user.findUnique({
		where: {
			token: token,
		},
	});
}
