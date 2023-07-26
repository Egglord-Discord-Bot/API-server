import CacheHandler from './CacheHandler';
import type { TwitchRequest, TwitchLivestreamData, TwitchLivestreamRequest, TwitchData, TwitchFollowersRequest } from '../../types/socials/Twitch';
import axios from 'axios';

export default class TwitchHandler extends CacheHandler {
	access_token: string | null;
	constructor() {
		super();
		this.access_token = null;
	}

	/**
	  * Function for fetching basic information on user
	  * @param {string} login The username to search
	*/
	async getUserByUsername(login: string): Promise<TwitchData> {
		const user = await this.request('/users', { login }) as TwitchRequest;
		return user.data[0];
	}

	/**
	  * Function for checking if user is streaming
	  * @param {string} username The username to search
	*/
	async getStreamByUsername(username: string): Promise<TwitchLivestreamData> {
		const stream = await this.request('/streams', { user_login: username }) as TwitchLivestreamRequest;
		return stream.data[0];
	}

	/**
	  * Function for fetching data from twitch API
	  * @param {string} endpoint the endpoint of the twitch API to request
	  * @param {object} queryParams The query sent to twitch API
	*/
	async request(endpoint: string, queryParams = {}): Promise<TwitchRequest | TwitchLivestreamRequest | TwitchFollowersRequest | undefined> {
		const qParams = new URLSearchParams(queryParams);
		try {
			const { data } = await axios.get(`https://api.twitch.tv/helix${endpoint}?${qParams.toString()}`, {
				headers: {
					'Client-ID': process.env.twitchId as string,
					'Authorization': `Bearer ${this.access_token}`,
				},
			});

			if (data.error == 'Unauthorized') {
				return this.refreshTokens()
					.then(() => this.request(endpoint, queryParams));
			}
			return data as TwitchRequest;
		} catch (err: any) {
			switch (err.response.data.error) {
				case 'Bad Request':
					return err.data;
				case 'Unauthorized': {
					return this.refreshTokens()
						.then(() => this.request(endpoint, queryParams));
				}
			}
		}
	}

	/**
	  * Function for fetching follower data from user
	  * @param {string} id the ID of the user
	*/
	async getFollowersFromId(id: string): Promise<number> {
		const followers = await this.request('/users/follows', { to_id: id }) as TwitchFollowersRequest;
		return followers.total;
	}

	/**
	  * Function for fetching access_token to interact with the twitch API
	*/
	private async refreshTokens() {
		const { data } = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.twitchId as string}&client_secret=${process.env.twitchSecret as string}&grant_type=client_credentials`);
		this.access_token = data.access_token;
	}

	createAccount() {

	}
}
