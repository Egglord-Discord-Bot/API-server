// dependecies
const express = require('express'),
	cors = require('cors'),
	app = express(),
	{ port } = require('./config'),
	helmet = require('helmet'),
	compression = require('compression');

const corsOpt = {
	origin: '*',
	credentials: true,
	methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version'],
	optionsSuccessStatus: 204,
};

// normal assets such as index.html or else.
const assets = __dirname + '/assets';
console.log(process.cwd());

app.use(helmet())
	.use(cors(corsOpt))
	.use(compression())
	.get('/favicon.ico', (req, res) => res.status(200).sendFile(assets + '/favicon.ico'))
	// for web-scalpers
	.get('/robots.txt', (req, res) => res.sendFile(assets + '/robots.txt'))
	// Home page
	.get('/', (req, res) => res.status(200).send('OK'))
	// /files endpoint for showing files
	.use('/image', require('./routes/images'))
	.use('/misc', require('./routes/misc'))
	// .use('/games', require('./routes/games'))
	.use('/nsfw', require('./routes/nsfw'))
	.listen(port, () => console.log(`Started on PORT: ${port}`));
