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

// Create a user with token
export async function createUser(data: userID) {
	return client.user.create({
		data: {
			id: data.id,
			token: '1',
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

// Update a user
export async function updateUser(data: userID) {
	return client.user.update({
		where: {
			id: data.id,
		},
		data: {
			token: '2',
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
