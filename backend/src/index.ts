// dependecies
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import { Utils, Error } from './utils';
import { join } from 'path';
import { RateLimiter } from './middleware';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import Client from './helpers/Client';
import type { time, swaggerJsdocType } from './types';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
dotenv.config();


(async () => {
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
	fs.writeFileSync(`${process.cwd()}/src/assets/JSON/endpoints.json`, JSON.stringify(openapiSpecification), 'utf8');

	// Load passport and endpoint data
	const client = new Client();
	await client.EndpointManager.checkEndpointData(client);
	const endpoints = Utils.generateRoutes(join(__dirname, './', 'routes')).filter(e => e.route !== '/index');
	const RateLimiterHandler = new RateLimiter(client);

	// The web server
	app.use(helmet({
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ['\'self\''],
				imgSrc: ['\'self\'', 'https://cdn.discordapp.com'],
			},
		},
	}))
		.set('trust proxy', true)
		.use(cors({
			origin: '*',
			credentials: true,
			methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version'],
			optionsSuccessStatus: 204,
		}))
		.use(compression())
		.use(bodyParser.json())
		.use(async (req: Request, res: Response, next: NextFunction) => {
			// Handle custom rate limits
			const newReq = req as Request & time;
			const newRes = res as Response & time;

			// Add time to request
			newReq._startTime = new Date().getTime();
			newReq._endTime = 0;

			// Add time to response
			newRes._startTime = new Date().getTime();
			newRes._endTime = 0;

			// Run logger & RateLimter
			client.Logger.connection(newReq, newRes);
			if (req.originalUrl.match(/\/api\/(?!(session|admin|stats)).*/g)) return RateLimiterHandler.checkRateLimit(newReq, newRes, next);

			// Display actualy response
			next();
		});

	// Dynamically load all endpoints
	for (const endpoint of endpoints) {
		client.Logger.debug(`Loading: ${endpoint.route} endpoint.`);
		const file = await import(endpoint.path);
		app.use(endpoint.route, file.run(client));
	}

	// Run the server on port
	app
		.use('/api/*', (req, res) => {
			Error.MissingEndpoint(res, req.originalUrl);
		})
		.listen(process.env.port, () => client.Logger.ready(`Started on PORT: ${process.env.port}`));
})();
