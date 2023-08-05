// dependecies
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import { Utils, Error } from './utils';
import { join } from 'path';
import RateLimter from './middleware/RateLimiter';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import Client from './helpers/Client';
import type { time } from './types';
dotenv.config();


(async () => {

	// Load passport and endpoint data
	const client = new Client();
	await (await import('./helpers/EndpointData')).default(client);
	const endpoints = Utils.generateRoutes(join(__dirname, './', 'routes')).filter(e => e.route !== '/index');
	const RateLimiterHandler = new RateLimter(client);

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
		.use((req: Request, res: Response, next: NextFunction) => {
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
			if (req.originalUrl !== '/favicon.ico') client.Logger.connection(newReq, newRes);
			if (req.originalUrl.startsWith('/api/') && 	!['/api/admin', '/api/session', '/api/stats'].some(i => req.originalUrl.startsWith(i))) return RateLimiterHandler.checkRateLimit(newReq, newRes, next);
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
