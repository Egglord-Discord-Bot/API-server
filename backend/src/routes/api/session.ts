import { Router } from 'express';
import { fetchUser, createUser } from '../../database/User';
import { fetchEndpointUsagesPerUser } from '../../database/userHistory';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
import { Utils } from '../../utils/Utils';
const router = Router();

export default function() {
	router.post('/signIn', async (req, res) => {
		const userId = req.query.userId as string;
		const { discriminator, avatar, locale, email, username } = req.body;

		// Create avatar URL
		let image_url;
		if (avatar == null) {
			image_url = `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
		} else {
			image_url = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`;
		}

		// Fetch / create user
		let user = await fetchUser(userId);
		if (user == null) {
			user = await createUser({ id: userId,
				token: new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate(),
				avatar: image_url,
				discriminator, locale, email,
			});
		}

		// Send updated profile back to user
		res.json({
			id: userId,
			isBlocked: user.isBlocked,
			isPremium: user.isPremium,
			isAdmin: user.isAdmin,
			avatar: image_url,
			discriminator, username, email,
		});
	});

	router.get('/history', async (req, res) => {
		const ses = await Utils.getSession(req);

		if (ses?.user) {
			const history = await fetchEndpointUsagesPerUser(ses.user.id);
			res.json(history);
		} else {
			res.json({});
		}
	});

	return router;
}
