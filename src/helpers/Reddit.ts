import axios from 'axios';
import { RedditPost } from '../utils/types';
import CacheHandler from './CacheHandler';
import { Utils } from '../utils/Utils';
export type redditType = 'hot' | 'new';


type redditChild = {
	data: object
}
type redditData = {
	children: Array<redditChild>
}


export default class Reddit extends CacheHandler {
	async fetchSubreddit(subreddit: string, type: redditType = 'hot') {
		// Fetch subreddit data
		try	{
			if (this.data.get(`${subreddit}_${type}`)) {
				console.log('Hit cache');
				const data = this.data.get(`${subreddit}_${type}`) as redditData;
				console.log(data);
				return new RedditPost(data.children[Utils.randomInteger(21)].data);
			} else {
				console.log('Didn\'t hit cache');
				const dataRes = (await axios.get(`https://reddit.com/r/${subreddit}/${type}.json?limit=20`)).data;

				// Make sure the subreddit has posts
				const post = dataRes.data.children[Utils.randomInteger(21)];
				const p = post?.data;
				if (!p) return { error: 'Subreddit does not exist or doesn\'t have any posts yet.' };

				// Return the data
				this._addData({ id: `${subreddit}_${type}`, data: dataRes.data });
				return new RedditPost(p);
			}
		} catch (err: any) {
			console.log(err);
			return { error: err.message };
		}
	}
}
