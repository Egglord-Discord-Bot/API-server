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
			const { data } = await axios.get(`https://api.twitter.com/1.1/users/show.json?screen_name=${username}`, {
				headers: {
					'authorization': `Bearer ${process.env.twitterBearerToken}`,
				},
			});

			return data;
		} catch (err: any) {
			return err.response.data;
		}
	}
}
