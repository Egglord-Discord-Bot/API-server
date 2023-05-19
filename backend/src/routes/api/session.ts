import { Router } from 'express';
import type Client from '../../helpers/Client';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
import { Utils } from '../../utils/Utils';
const router = Router();

export function run(client: Client) {
	router.post('/signIn', async (req, res) => {
		const userId = BigInt(req.query.userId as string);
		const { discriminator, avatar, locale, email, username } = req.body;

		// Create avatar URL
		let image_url;
		if (avatar == null) {
			image_url = `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
		} else {
			image_url = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`;
		}

		// Fetch / create user
		try {
			let user = await client.UserManager.fetchByParam({ id: BigInt(userId) });
			if (user == null) {
				user = await client.UserManager.create({ id: userId,
					token: new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate(),
					avatar: image_url,
					discriminator, locale, email, username,
				});
			}

			// Send updated profile back to user
			res.json({
				id: `${userId}`,
				isBlocked: user.isBlocked,
				isPremium: user.isPremium,
				isAdmin: user.isAdmin,
				avatar: image_url,
				token: user.token,
				discriminator, username, email,
			});

			// Update the database if any changes are found
			if (username != user.username || discriminator != user.discriminator || image_url != user.avatar) await client.UserManager.update({ id: userId, username, discriminator, avatar: image_url });
		} catch (err) {
			console.log(err);
			res.json();
		}
	});

	router.get('/history', async (req, res) => {
		const ses = await Utils.getSession(req);
		const page = req.query.page;

		if (ses?.user) {
			const history = await client.UserHistoryManager.fetchEndpointUsagesPerUser({ userId: BigInt(ses.user.id), page: (page && !Number.isNaN(page)) ? Number(page) : 0 });
			res.json({ history: history.map(h => ({ ...h, userId: '' })) });
		} else {
			res.json({ history: [] });
		}
	});

	return router;
}
