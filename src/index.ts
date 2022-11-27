// dependecies
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';
import session from 'express-session';
import { Utils } from './utils/Utils';
import { Logger } from './utils/Logger';
import { join } from 'path';
import RateLimter from './middleware/RateLimiter';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
	// Load passport and endpoint data
	(await import('./middleware/passport')).default(passport);
	await (await import('./helpers/EndpointData')).default();

	const RateLimiterHandler = new RateLimter();

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
		.use(session({
			secret: process.env.sessionSecret as string,
			resave: false,
			saveUninitialized: false,
		}))
		.use(bodyParser.json())
		// Initializes passport and session.
		.use(passport.initialize())
		.use(passport.session())
		.use((req, res, next) => {
			if (req.originalUrl !== '/favicon.ico') Logger.connection(req, res);
			next();
		})
		.use(express.static('./src/public'))
		// for web-scalpers
		.get('/robots.txt', (_req, res) => {
			res
				.type('text/plain')
				.send('User-agent: *\ndisallow: /');
		})
		// Home page
		.engine('html', (await import('ejs')).renderFile)
		.set('view engine', 'ejs')
		.set('views', './src/views')
		.use((req: Request, res: Response, next: NextFunction) => {
			// Handle custom rate limits
			if (req.originalUrl.startsWith('/api/') && !req.originalUrl.startsWith('/api/admin')) return RateLimiterHandler.checkRateLimit(req, res, next);
			next();
		});
	// Dynamically load all endpoints
	const endpoints = Utils.generateRoutes(join(__dirname, './', 'routes')).filter(e => e.route !== '/index');
	for (const endpoint of endpoints) {
		Logger.debug(`Loading: ${endpoint.route} endpoint.`);
		app.use(endpoint.route, (await import(endpoint.path)).default());
	}

	// Run the server on port
	app
		.use('/', (await import('./routes/index')).default())
		.listen(process.env.port, () => Logger.log(`Started on PORT: ${process.env.port}`));
})();
