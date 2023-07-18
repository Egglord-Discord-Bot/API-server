import type { SKRSContext2D } from '@napi-rs/canvas';

export type userID = {
	id: number
	endpoint: string
}

export type time = {
	_startTime: number
	_endTime: number
}

export type loggerTypes = 'log' | 'warn' | 'error' | 'debug' | 'ready'

export type imageParam = Buffer | string
export type getLines = {
	text: string
	ctx: SKRSContext2D
	maxWidth: number
}


export type ParamAPIEndpoint = {
	name?: string
	description?: string
	required?: boolean
	type?: string
}

export type APIEndpointData = {
	endpoint: string
	method: string
	description: string
	tag: string
	responses: Array<string>
	parameters?: Array<ParamAPIEndpoint>
}

type swaggerPath = { [key:string]: {
	'get'?: any;
}
}

export interface swaggerJsdocType {
	openapi: number
  info: {
		title: string,
		version: string
	}
  paths: swaggerPath
	tags: Array<string>
}
