// dependecies
import express from 'express';
import cors from 'cors';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import config from './config';

(async () => {
	// The web server
	app.use(helmet())
		.use(cors({
			origin: '*',
			credentials: true,
			methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version'],
			optionsSuccessStatus: 204,
		}))
		.use(compression())
		// for web-scalpers
		.get('/robots.txt', (_req, res) => {
			res
				.type('text/plain')
				.send('User-agent: *\ndisallow: /');
		})
		// Home page
		.get('/', (_req, res) => res.status(200).send('OK'))
		// /files endpoint for showing files
		.use('/image', (await import('./routes/image')).default())
		.use('/games', (await import('./routes/games')).default())
		.use('/misc', (await import('./routes/misc')).default())
		.use('/info', (await import('./routes/info')).default())
		.use('/nsfw', (await import('./routes/nsfw')).default())
		.listen(config.port, () => console.log(`Started on PORT: ${config.port}`));

})();
