import { Router } from 'express';
import { Client } from '../../../helpers';
import { Error, Utils } from '../../../utils';
const router = Router();

export function run(client: Client) {
	router.get('/', async (req, res) => {
		// Check if user is logged in and is admin
		const ses = await Utils.getSession(req);
		if (ses?.user == undefined) return Error.Unauthorized(res);

		const notifications = await client.NotificationManager.fetchNotificationsByUserId({ userId: ses.user.id });
		res.json({ notifications: notifications.map(n => ({ ...n, userId: n.userId?.toString() })) });
	});

	return router;
}