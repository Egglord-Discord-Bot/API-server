import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import type { swaggerJsdocType } from '../../../../types';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';
import fs from 'fs';
const router = Router();

export function run(client: Client) {
	router.get('/json', async (req, res) => {
		// See if the includeHistory query was made aswell
		const history = req.query.includeHistory as string;
		if (history && !['true', 'false'].includes(history)) return Error.InvalidValue(res, 'includeHistory', ['true', 'false']);

		try {
			const endpoints = await client.EndpointManager.fetchEndpointData(true, (history == 'true') ? true : false);
			const openapiSpecification = JSON.parse(fs.readFileSync(`${process.cwd()}/src/assets/JSON/endpoints.json`).toString()) as swaggerJsdocType;
			const el = endpoints.map(e => ({ ...e, data: openapiSpecification.paths[`${e.name.replace('/api', '')}`]?.get }));
			res.json({ endpoints: el });
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
