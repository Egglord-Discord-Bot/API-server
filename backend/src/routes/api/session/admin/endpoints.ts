import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';

const router = Router();

export function run(client: Client) {
	router.get('/json', async (req, res) => {
		// See if the includeHistory query was made aswell
		const history = req.query.includeHistory as string;
		if (history && !['true', 'false'].includes(history)) return Error.InvalidValue(res, 'includeHistory', ['true', 'false']);

		try {
			res.json({ endpoints: await client.EndpointManager.fetchEndpointData() });
		} catch (err) {
			console.log(err);
			res.json({ endpoints: [] });
		}
	});

	router.patch('/update', isAdmin, async (req, res) => {
		// Validate request body data
		const { name, cooldown,	maxRequests,	maxRequestper, isBlocked, premiumOnly } = req.body;
		if (!name || typeof name !== 'string') return Error.MissingFromBody(res, 'name', 'string');
		if (!cooldown || Number.isNaN(cooldown)) return Error.MissingFromBody(res, 'cooldown', 'number');
		if (!maxRequests || Number.isNaN(maxRequests)) return Error.MissingFromBody(res, 'maxRequests', 'number');
		if (!maxRequestper || Number.isNaN(maxRequestper)) return Error.MissingFromBody(res, 'maxRequestper', 'number');
		if (typeof isBlocked !== 'boolean') return Error.MissingFromBody(res, 'isBlocked', 'boolean');
		if (typeof premiumOnly !== 'boolean') return Error.MissingFromBody(res, 'premiumOnly', 'boolean');


		try {
			const endpoint = await client.EndpointManager.update({ name, cooldown: Number(cooldown),	maxRequests: Number(maxRequests),
				maxRequestper: Number(maxRequestper),	isBlocked,	premiumOnly });
			res.json({ success: `Successfully updated endpoint: ${endpoint.name}` });
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	return router;
}
