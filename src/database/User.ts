import client from './client';

// Fetch a user
export async function fetchUser(id: string) {
	return client.user.findUnique({
		where: {
			id: id,
		},
	});
}

export async function fetchUsers() {
	return client.user.findMany();
}

type createUser = {
	id: string
	token: string
}
// Create a user with token
export async function createUser(data: createUser) {
	return client.user.create({
		data: {
			id: data.id,
			token: data.token,
		},
	});
}

// Delete a user
export async function deleteUser(id: string) {
	return client.user.delete({
		where: {
			id: id,
		},
	});
}

type updateUser = {
	id: string
	newToken?: string
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
