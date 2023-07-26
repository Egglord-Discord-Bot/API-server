import CacheHandler from './CacheHandler';
import axios from 'axios';

export default class TwitchHandler extends CacheHandler {
	access_token: string | null;
	constructor() {
		super();
		this.access_token = null;
	}

	async fetchUser(username: string) {
		try {
			const { data } = await axios.get(`https://api.twitter.com/2/users/by?screen_name=${username}`, {
				headers: {
					'User-Agent': 'v2UserLookupJS',
					'Authorization': `Bearer ${process.env.twitterBearerToken}`,
					'Content-Type': 'application/json',
				},
			});

			return data;
		} catch (err: any) {
			return err.response.data;
		}
	}
}
