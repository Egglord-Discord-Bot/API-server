// dependecies
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import { Utils } from './utils/Utils';
import { Logger } from './utils/Logger';
import { join } from 'path';
import RateLimter from './middleware/RateLimiter';
import bodyParser from 'body-parser';
import Error from './utils/Errors';
import * as dotenv from 'dotenv';
import Client from './helpers/Client';
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
		.use(cors({
			origin: '*',
			credentials: true,
			methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version'],
			optionsSuccessStatus: 204,
		}))
		.use(compression())
		.use(bodyParser.json())
		// Initializes passport and session.
		.use((req, res, next) => {
			if (req.originalUrl !== '/favicon.ico') Logger.connection(req, res);
			next();
		})
		.use((req: Request, res: Response, next: NextFunction) => {
			// Handle custom rate limits
			if (req.originalUrl.startsWith('/api/') && !(req.originalUrl.startsWith('/api/admin') || req.originalUrl.startsWith('/api/session') || req.originalUrl.startsWith('/api/stats'))) return RateLimiterHandler.checkRateLimit(req, res, next);
			next();
		});

	// Dynamically load all endpoints
	for (const endpoint of endpoints) {
		Logger.debug(`Loading: ${endpoint.route} endpoint.`);
		const file = await import(endpoint.path);
		app.use(endpoint.route, file.run(client));
	}

	// Run the server on port
	app
		.use('/api/*', (req, res) => {
			Error.MissingEndpoint(res, req.originalUrl);
		})
		.listen(process.env.port, () => Logger.log(`Started on PORT: ${process.env.port}`));
})();
