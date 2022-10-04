import client from './client';

type userID = {
	id: string
}

// Fetch a user
export async function fetchUser(data: userID) {
	return client.user.findUnique({
		where: {
			id: data.id,
		},
	});
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
export async function deleteServer(data: userID) {
	return client.user.delete({
		where: {
			id: data.id,
		},
	});
}

type updateUser = {
	id: string
	newToken: string
}

// Update a user
export async function updateUser(data: updateUser) {
	return client.user.update({
		where: {
			id: data.id,
		},
		data: {
			token: data.newToken,
		},
	});
}

type fetchUserByToken = {
	token: string
}

export async function fetchUserByToken(data: fetchUserByToken) {
	return client.user.findUnique({
		where: {
			token: data.token,
		},
	});
}
