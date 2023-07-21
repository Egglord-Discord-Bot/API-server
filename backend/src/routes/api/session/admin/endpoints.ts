import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import type { swaggerJsdocType } from '../../../../types';
import swaggerJsdoc from 'swagger-jsdoc';
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


	return router;
}
