import client from './client';

// Fetch a user
export async function fetchUser(id: string) {
	return client.user.findUnique({
		where: {
			id: id,
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
export async function deleteServer(id: string) {
	return client.user.delete({
		where: {
			id: id,
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


export async function fetchUserByToken(token: string) {
	return client.user.findUnique({
		where: {
			token: token,
		},
	});
}
