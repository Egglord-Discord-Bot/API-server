// dependecies
const express = require('express'),
	cors = require('cors'),
	app = express(),
	{ port } = require('./config'),
	helmet = require('helmet'),
	expressJSDocSwagger = require('express-jsdoc-swagger'),
	compression = require('compression');


expressJSDocSwagger(app)({
	info: {
		version: '1.0.0',
		title: 'Egglord API server',
		license: {
			name: 'MIT',
		},
	},
	security: {
		BasicAuth: {
			type: 'http',
			scheme: 'basic',
		},
	},
	baseDir: __dirname,
	// Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
	filesPattern: './**/*.js',
	// URL where SwaggerUI will be rendered
	swaggerUIPath: '/api-docs',
	// Expose OpenAPI UI
	exposeSwaggerUI: true,
	// Expose Open API JSON Docs documentation in `apiDocsPath` path.
	exposeApiDocs: false,
	// Open API JSON Docs endpoint.
	apiDocsPath: '/v3/api-docs',
	// Set non-required fields as nullable by default
	notRequiredAsNullable: false,
	// You can customize your UI options.
	// you can extend swagger-ui-express config. You can checkout an example of this
	// in the `example/configuration/swaggerOptions.js`
	swaggerUiOptions: {},
	// multiple option in case you want more that one instance
	multiple: true,
});

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
	.get('/robots.txt', (req, res) => {
		res
			.type('text/plain')
			.send('User-agent: *\ndisallow: /');
	})
	// Home page
	.get('/', (req, res) => res.status(200).send('OK'))
	// /files endpoint for showing files
	.use('/image', require('./routes/image'))
	.use('/misc', require('./routes/misc'))
	.use('/games', require('./routes/games'))
	.use('/nsfw', require('./routes/nsfw'))
	.listen(port, () => console.log(`Started on PORT: ${port}`));
