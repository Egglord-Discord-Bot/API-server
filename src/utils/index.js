module.exports = {
	// Make sure an image was sent aswell
	checkImage: async function(req, res, next) {
		const image = req.query.image;
		if (!image) return res.json({ error: 'Missing image query' });
		next();
	},
};
