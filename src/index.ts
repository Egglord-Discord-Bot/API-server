// dependecies
import express from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';

(async () => {
	(await import('./utils/passport')).default(passport)
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
		// /files endpoint for showing files
		.use('/', (await import('./routes/index')).default())
		.use('/image', (await import('./routes/image')).default())
		.use('/games', (await import('./routes/games')).default())
		.use('/misc', (await import('./routes/misc')).default())
		.use('/info', (await import('./routes/info')).default())
		.use('/nsfw', (await import('./routes/nsfw')).default())
		.listen(config.port, () => console.log(`Started on PORT: ${config.port}`));
})();
