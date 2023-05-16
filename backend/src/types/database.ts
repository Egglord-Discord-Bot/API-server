/* USER DATABASE TYPES */
export type updateUser = {
	id: bigint
	newToken?: string
	username?: string
	avatar?: string
	discriminator?: string
	isAdmin?: boolean
	isBlocked?: boolean
	isPremium?: boolean
}

export type createUser = {
	id: bigint
	token: string
	username?: string
	discriminator?: string
	avatar?: string
	locale?: string
	email?: string
}

export type userUnqiueParam = {
	id?: bigint
	token?: string
}

/* USER HISTORY TYPES */
export type endpointUserParam = {
	id: bigint
	endpoint: string
}

/* ENDPOINT DATA TYPES */
export type createEndpointData = {
	name: string
	cooldown?: number
	maxRequests?: number
	maxRequestper?: number
	premiumOnly?: boolean
}

export type updateEndpointData = {
	name: string
	cooldown?: number
	maxRequests?: number
	maxRequestper?: number
	isBlocked?: boolean
	premiumOnly?: boolean
}

/* MISC */
export type pagination = {
	page: number
}
