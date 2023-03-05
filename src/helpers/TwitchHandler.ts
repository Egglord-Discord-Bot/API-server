import CacheHandler from './CacheHandler';
import type { TwitchRequest } from '../utils/types';
import axios from 'axios';

export default class TwitchHandler extends CacheHandler {
	access_token: string | null;
	constructor() {
		super();
		this.access_token = null;
	}

	/**
	 * Function for fetching basic information on user
	 * @param {interaction} login The username to search
	*/
	async getUserByUsername(login: string) {
		return this.request('/users', { login }).then((u) => u && u.data[0]);
	}

	/**
	 * Function for checking if user is streaming
	 * @param {interaction} username The username to search
	*/
	async getStreamByUsername(username: string) {
		return this.request('/streams', { user_login: username }).then((s) => s && s.data[0]);
	}

	/**
	 * Function for fetching data from twitch API
	 * @param {string} endpoint the endpoint of the twitch API to request
	 * @param {object} queryParams The query sent to twitch API
	*/
	async request(endpoint: string, queryParams = {}): Promise<TwitchRequest | undefined> {
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
			console.log('data', data);
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
	async getFollowersFromId(id: string) {
		return this.request('/users/follows', { to_id: id }).then(u => u && u.total);
	}

	/**
	 * Function for fetching access_token to interact with the twitch API
	*/
	async refreshTokens() {
		const { data } = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.twitchId as string}&client_secret=${process.env.twitchSecret as string}&grant_type=client_credentials`);
		this.access_token = data.access_token;
	}
}
