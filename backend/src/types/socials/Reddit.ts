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
