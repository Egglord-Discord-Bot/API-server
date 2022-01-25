const express = require('express'),
	router = express.Router(),
	{ debug } = require('../config'),
	fresh = require('fresh');

router.get('/', (req, res) => {
	res.send('hello');
});

// Caching
function isFresh(req, res) {
	return fresh(req.headers, {
		'etag': res.getHeader('ETag'),
		'last-modified': res.getHeader('Last-Modified'),
	});
}

module.exports = router;
