export class TwitchAccount {
	constructor(data: any) {
		this.id = data.id;
		this.login = data.login;
		this.display_name = data.display_name;
		this.type = data.type;
		this.broadcaster_type = data.broadcaster_type;
		this.description = data.description;
	}
}

export interface TwitchAccount {
	id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number,
  created_at: Date
  followers: number,
  steaming: {
    title: string
    game: string
    started_at: Date
    viewer_count: number,
    is_mature: boolean,
    thumbnail_url: string
  }
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
