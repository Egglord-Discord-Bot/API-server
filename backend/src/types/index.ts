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
	name: string
	description: string
	required: boolean
	type: 'string' | 'number'
	default?: string | number
  minimum?: number
  maximum?: number
	enum?: Array<string | number>
}

export type APIEndpointData = {
	endpoint: string
	method: string
	description: string
	tag: string
	responses: Array<string>
	parameters?: Array<ParamAPIEndpoint>
}

type swaggerPath = {
	[key:string]: {
		get: APIEndpointData
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

export interface RadioStation {
	website: string
	name: string
	audio: string
}

export interface ILocation {
	name: string
  lat: string
  lng: string
  country: string
  admin1: string
  admin2: string
}