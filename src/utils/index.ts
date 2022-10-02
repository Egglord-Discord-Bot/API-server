import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export function checkImage(req: Request, res: Response, next: NextFunction) {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });
	next();
}

export async function fetchSubreddit(subreddit: string) {
	// Fetch subreddit data
	try	{
		const dataRes = await axios.get(`https://reddit.com/r/${subreddit}/new.json?limit=1`);

		// Make sure the subreddit has posts
		const post = dataRes.data.data.children[0];
		const p = post?.data;
		if (!p) return { error: 'Subreddit does not exist or doesn\'t have any posts yet.' };

		// Return the data
		return {
			title: p.title || '',
			url: p.url || '',
			thumbnail: p.thumbnail,
			published: p.created_utc,
			permalink: `https://reddit.com${p.permalink}`,
			metadata: {
				nsfw: p.over_18,
				isVideo: p.is_video,
				pinned: p.pinned,
			},
			name: p.author || 'Deleted',
			sub: {
				name: p.subreddit || subreddit,
				followers: p.subreddit_subscribers,
			},
			votes: {
				upvotes: p.ups,
				downvotes: p.downs,
			},
		};
	} catch (err: any) {
		console.log(err);
		return { error: err.message };
	}
}
