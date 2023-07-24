import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import type { swaggerJsdocType } from '../../../../types';
import { isAdmin } from '../../../../middleware/middleware';
import swaggerJsdoc from 'swagger-jsdoc';
import { Error } from '../../../../utils';
const router = Router();

export function run(client: Client) {
	router.get('/json', async (_req, res) => {
		try {
			const endpoints = await client.EndpointManager.fetchEndpointData();
			const openapiSpecification = swaggerJsdoc({
				failOnErrors: true,
				definition: {
					openapi: '3.0.0',
					info: {
						title: 'Hello World',
						version: '1.0.0',
					},
				},
				apis: ['./src/routes/api/*.ts'],
			}) as swaggerJsdocType;
			const el = endpoints.map(e => ({ ...e, data: openapiSpecification.paths[`${e.name.replace('/api', '')}`]?.get }));

			res.json({ endpoints: el });
		} catch (err) {
			console.log(err);
			res.json({ endpoints: [] });
		}
	});

	router.patch('/', isAdmin, async (req, res) => {
		const { name, cooldown,	maxRequests,	maxRequestper, isBlocked, premiumOnly } = req.body;

		try {
			const endpoint = await client.EndpointManager.update({ name, cooldown,	maxRequests,	maxRequestper,	isBlocked,	premiumOnly });
			res.json({ success: `Successfully updated endpoint: ${endpoint.name}` });
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});

	return router;
}
