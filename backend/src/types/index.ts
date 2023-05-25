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

export class RedditPost {
	constructor(data: any) {
		this.title = data.title || '';
		this.url = data.url || '';
		this.thumbnail = data.thumbnail == 'self' ? null : data.thumbnail;
		this.published = data.created_utc;
		this.permalink = `https://reddit.com${data.permalink}`;
		this.description = data.selftext ?? null;
		this.metadata = {
			nsfw: data.over_18,
			isVideo: data.is_video,
			pinned: data.pinned,
		},
		this.author = data.author || 'Deleted';
		this.sub = {
			name: data.subreddit,
			followers: data.subreddit_subscribers,
		};
		this.votes = {
			upvotes: data.ups,
			downvotes: data.downs,
		};
	}
}


export interface RedditPost {
	title: string
	url: string
	thumbnail: string | null
	description: string | null
	published: number
	permalink: string
	metadata: {
		nsfw: boolean
		isVideo: boolean
		pinned: boolean
	},
	author: string
	sub: {
		name: string
		followers: number,
	},
	votes: {
		upvotes: number,
		downvotes: number,
	},
}

export type TwitchData = {
	id: string,
	login: string,
	display_name: string,
	type: string,
	broadcaster_type: string,
	description: string,
	profile_image_url: string,
	offline_image_url: string,
	view_count: number,
	created_at: string,
}

export interface TwitchRequest {
	total?: number
	data: Array<TwitchData>
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

export interface TwitchLivestreamRequest {
	data: Array<TwitchLivestreamData>
}

export type TwitchLivestreamData = {
	id: string,
	user_id: string
	user_login: string
	user_name: string
	game_id: string
	game_name: string
	type: string
	title: string
	viewer_count: number
	started_at: Date
	language: string
	thumbnail_url: string
	tag_ids: Array<string>
	tags: Array<string>
	is_mature: boolean
}

export interface TwitchFollowersRequest {
	total: number
	data: Array<TwitchFollowersData>
}

export type TwitchFollowersData = {
	from_id: string,
	from_login: string,
	from_name: string,
	to_id: string,
	to_login: string,
	to_name: string,
	followed_at: Date
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
