// dependecies
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import { Utils } from './utils/Utils';
import { join } from 'path';
import RateLimter from './helpers/RateLimiter';


(async () => {
	(await import('./utils/passport')).default(passport);
	const RateLimiterHandler = new RateLimter();

	// The web server
	app.use(helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ['\'self\''],
				'script-src': ['\'unsafe-inline\'', 'https://kit.fontawesome.com', 'https://twemoji.maxcdn.com'],
				'img-src': ['\'unsafe-inline\'', 'https://cdn.discordapp.com', 'https://unpkg.com', 'https://img.youtube.com', 'data:'],
				'style-src': ['\'unsafe-inline\''],
				'connect-src': ['\'unsafe-inline\'', 'https://ka-f.fontawesome.com'],
				'font-src': ['\'unsafe-inline\'', 'https://ka-f.fontawesome.com'],
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
			secret: config.sessionSecret,
			resave: false,
			saveUninitialized: false,
		}))
		// Initializes passport and session.
		.use(passport.initialize())
		.use(passport.session())
		.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
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
			if (req.originalUrl.startsWith('/api')) return RateLimiterHandler.checkRateLimit(req, res, next);
			next();
		});
	// /files endpoint for showing files
	// Get all routes
	const endpoints = Utils.generateRoutes(join(__dirname, './', 'routes'));

	for (const endpoint of endpoints) {
		console.log(`Loading: ${endpoint.route} endpoint.`, 'log');
		app.use(endpoint.route, (await import(endpoint.path)).default());
	}

	// Run the server on port
	app.listen(config.port, () => console.log(`Started on PORT: ${config.port}`));
})();
