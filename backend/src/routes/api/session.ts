import { Router } from 'express';
import type Client from '../../helpers/Client';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
import { Utils, Error } from '../../utils';
import axios from 'axios';
const router = Router();

export function run(client: Client) {
	router.get('/', async (req, res) => {
		const { access_token, id } = req.query;
		const user = await client.UserManager.fetchByParam({ id: BigInt(id as string) });

		// Validate user session
		if (!user) return res.status(403).json({ error: 'Incorrect userID' });
		if (access_token != user.access_token) return res.status(403).json({ error: 'Access token mismatch.' });
		if (new Date(user.expiresAt ?? 0) <= new Date()) return res.status(403).json({ error: 'Access token has expired.' });

		// Give back new user obj
		res.json({
			id: `${user.id}`,
			role: user.role,
			avatar: user.avatar,
			token: user.token,
			username: user.username,
			email: user.email,
			access_token: user.access_token,
		});
	});


	router.post('/signIn', async (req, res) => {
		// Validate request
		const userId = BigInt(req.query.userId as string);
		const { access_token, refresh_token, expiresAt } = req.body;

		if (!(/(\d{17,20})/g.test(`${userId}`))) return Error.GenericError(res, 'Invalid user ID');
		if (typeof access_token !== 'string') return Error.MissingFromBody(res, 'access_token', 'string');
		if (typeof refresh_token !== 'string') return Error.MissingFromBody(res, 'refresh_token', 'string');

		try {
			const { data } = await axios.get('https://discord.com/api/v10/users/@me', {
				headers: {
					'authorization': `Bearer ${access_token}`,
				},
			});

			// Get discord account data
			const { avatar, discriminator, locale, email, username } = data as { [key:string]: string };

			// Create avatar URL
			let image_url;
			if (avatar == null) {
				// Check if they are still on legacy discriminator system
				if (discriminator && discriminator != '0') {
					image_url = `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}.png`;
				} else {
					image_url = `https://cdn.discordapp.com/embed/avatars/${Number(userId >> BigInt(22)) % 6}.png`;
				}
			} else {
				image_url = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`;
			}

			// Fetch / create user
			let user = await client.UserManager.fetchByParam({ id: userId });
			if (user == null) {
				user = await client.UserManager.create({ id: userId,
					token: new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate(),
					avatar: image_url,
					locale: locale ?? null,
					email: email ?? null,
					access_token, refresh_token, username, expiresAt: new Date(expiresAt * 1000),
				});
			}

			// Send updated profile back to user
			res.json({
				id: `${userId}`,
				role: user.role,
				avatar: image_url,
				token: user.token,
				username, email, access_token,
			});

			// Update the database if any changes are found
			if (username != user.username || image_url != user.avatar || access_token != user.access_token
				|| refresh_token != user.refresh_token || expiresAt != user.expiresAt) await client.UserManager.update({ id: userId, username, avatar: image_url, refresh_token, access_token, expiresAt: new Date(expiresAt * 1000) });
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, axios.isAxiosError(err) ? `${err.response?.data}` : `${err}`);
		}
	});

	router.get('/history', async (req, res) => {
		const ses = await Utils.getSession(req);
		const page = req.query.page;

		if (ses?.user) {
			const [history, total] = await Promise.all([client.UserHistoryManager.fetchEndpointUsagesPerUser({ userId: BigInt(ses.user.id), page: (page && !Number.isNaN(page)) ? Number(page) : 0 }),
				client.UserHistoryManager.fetchCountByUserId(BigInt(ses.user.id))]);

			res.json({ history: history.map(h => ({ ...h, userId: `${ses.user.id}` })), total });
		} else {
			res.json({ history: [], total: 0 });
		}
	});

	router.get('/history/graph', async (req, res) => {
		const ses = await Utils.getSession(req);

		if (ses?.user) {
			const t = await client.UserHistoryManager.fetchEndpointCountByUser(BigInt(ses.user.id));
			res.json({ data: t });
		}
	});

	// Regenerate a new token
	router.post('/regenerate', async (req, res) => {
		const ses = await Utils.getSession(req);
		if (ses?.user) {
			try {
				const token = new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate();
				await client.UserManager.update({ id: BigInt(ses.user.id), newToken: token });
				res.json({ success: 'Successfully updated users token', token });
			} catch (err) {
				console.log(err);
				res.json({ error: 'Failed to update users token' });
			}
		} else {
			res.json({ error: 'Error' });
		}
	});

	router.get('/stats', async (_req, res) => {
		try {
			const [users, endpoints, endpointUsage] = await Promise.all([client.UserManager.fetchCount(), client.EndpointManager.fetchCount(), client.UserHistoryManager.fetchCount()]);
			res.json({
				userCount: users,
				endpointCount: endpoints,
				historyCount: endpointUsage,
			});
		} catch (err) {
			res.json({
				userCount: 0,
				endpointCount: 0,
				historyCount: 0,
			});
		}
	});

	return router;
}
