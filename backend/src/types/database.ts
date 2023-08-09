import type { Role } from '@prisma/client';

/* USER DATABASE TYPES */
export type updateUser = {
	id: bigint
	newToken?: string
	username?: string
	avatar?: string
	discriminator?: string
	role?: Role
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

export type fetchUsersParam = {
	orderDir: 'asc' | 'desc' | undefined
	orderType: 'joinedAt' | 'requests' | undefined
	includeHistory?: boolean
} & pagination

export type userUnqiueParam = {
	id?: bigint
	token?: string
}

/* USER HISTORY TYPES */
export type UserHistoryCreateParam = {
	id: bigint | null
	endpoint: string
	responseCode: number
	responseTime: number
}

export type endpointUserUnique = {
	userId: bigint
}

export type fetchHistoryParam = {
	orderDir: 'asc' | 'desc' | undefined
	orderType: 'accessedAt' | 'statusCode' | undefined
} & pagination

/* ENDPOINT DATA TYPES */
export type createEndpointData = {
	name: string
	cooldown?: number
	maxRequests?: number
	maxRequestper?: number
	premiumOnly?: boolean
	isValid?: boolean
}

export type updateEndpointData = {
	name: string
	cooldown?: number
	maxRequests?: number
	maxRequestper?: number
	isBlocked?: boolean
	premiumOnly?: boolean
	isValid?: boolean
}

/* MISC */
export type pagination = {
	page: number
}
