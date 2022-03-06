const express = require('express'),
	router = express.Router(),
	{ checkImage } = require('../utils'),
	{ Canvacord } = require('Canvacord');

/**
  * GET /image/3000years
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/3000years', checkImage, async (req, res) => {

});

/**
  * GET /image/affect
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/affect', checkImage, async (req, res) => {
	const image = req.query.image;
	try {
		const card = new Canvacord();
		await card.affect(image);
		res.json({ succes: image.toBuffer() });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /image/afusion
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/afusion', checkImage, async (req, res) => {

});

/**
  * GET /image/approved
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/approved', checkImage, async (req, res) => {

});

/**
  * GET /image/badge
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/badge', checkImage, async (req, res) => {

});

/**
  * GET /image/batslap
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/batslap', checkImage, async (req, res) => {

});

/**
  * GET /image/beautiful
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/beautiful', checkImage, async (req, res) => {

});

/**
  * GET /image/blur
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/blur', checkImage, async (req, res) => {

});

/**
  * GET /image/blurple
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/blurple', checkImage, async (req, res) => {

});

/**
  * GET /image/brazzers
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/brazzers', checkImage, async (req, res) => {

});

/**
  * GET /image/burn
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/burn', checkImage, async (req, res) => {

});

/**
  * GET /image/challenger
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/challenger', checkImage, async (req, res) => {

});

/**
  * GET /image/circle
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/circle', checkImage, async (req, res) => {

});

/**
  * GET /image/contrast
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/contrast', checkImage, async (req, res) => {

});

/**
  * GET /image/crush
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/crush', checkImage, async (req, res) => {

});

/**
  * GET /image/ddungeon
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/ddungeon', checkImage, async (req, res) => {

});

/**
  * GET /image/deepfry
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/deepfry', checkImage, async (req, res) => {

});

/**
  * GET /image/dictator
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/dictator', checkImage, async (req, res) => {

});

/**
  * GET /image/discordhouse
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/discordhouse', checkImage, async (req, res) => {

});

/**
  * GET /image/distort
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/distort', checkImage, async (req, res) => {

});

/**
  * GET /image/dither565
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/dither565', checkImage, async (req, res) => {

});

/**
  * GET /image/emboss
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/emboss', checkImage, async (req, res) => {

});

/**
  * GET /image/facebook
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/facebook', checkImage, async (req, res) => {

});

/**
  * GET /image/fire
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/fire', checkImage, async (req, res) => {

});

/**
  * GET /image/frame
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/frame', checkImage, async (req, res) => {

});

/**
  * GET /image/gay
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/gay', checkImage, async (req, res) => {

});

/**
  * GET /image/glitch
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/glitch', checkImage, async (req, res) => {

});

/**
  * GET /image/greyple
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/greyple', checkImage, async (req, res) => {

});

/**
  * GET /image/greyscale
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/greyscale', checkImage, async (req, res) => {

});

/**
  * GET /image/instagram
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/instagram', checkImage, async (req, res) => {

});

/**
  * GET /image/invert
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/invert', checkImage, async (req, res) => {

});

/**
  * GET /image/jail
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/jail', checkImage, async (req, res) => {

});

/**
  * GET /image/lookwhatkarenhave
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/lookwhatkarenhave', checkImage, async (req, res) => {

});

/**
  * GET /image/majik
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/majik', checkImage, async (req, res) => {

});

/**
  * GET /image/missionpassed
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/missionpassed', checkImage, async (req, res) => {

});

/**
  * GET /image/ps4
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/ps4', checkImage, async (req, res) => {

});

/**
  * GET /image/posterize
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/posterize', checkImage, async (req, res) => {

});

/**
  * GET /image/rejected
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/rejected', checkImage, async (req, res) => {

});

/**
  * GET /image/redple
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/redple', checkImage, async (req, res) => {

});

/**
  * GET /image/rip
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/rip', checkImage, async (req, res) => {

});

/**
  * GET /image/scary
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/scary', checkImage, async (req, res) => {

});

/**
  * GET /image/sepia
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/sepia', checkImage, async (req, res) => {

});

/**
  * GET /image/sharpen
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/sharpen', checkImage, async (req, res) => {

});

/**
  * GET /image/sniper
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/sniper', checkImage, async (req, res) => {

});

/**
  * GET /image/steamcard
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/steamcard', checkImage, async (req, res) => {

});

/**
  * GET /image/symmetry
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/symmetry', checkImage, async (req, res) => {

});

/**
  * GET /image/thanos
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/thanos', checkImage, async (req, res) => {

});

/**
  * GET /image/tobecontinued
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/tobecontinued', checkImage, async (req, res) => {

});

/**
  * GET /image/twitter
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/twitter', checkImage, async (req, res) => {

});

/**
  * GET /image/triggered
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/triggered', checkImage, async (req, res) => {

});

/**
  * GET /image/utatoo
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/utatoo', checkImage, async (req, res) => {

});

/**
  * GET /image/vs
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/vs', checkImage, async (req, res) => {

});

/**
  * GET /image/wanted
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/wanted', checkImage, async (req, res) => {

});

/**
  * GET /image/wasted
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/wasted', checkImage, async (req, res) => {

});

/**
  * GET /image/whowouldwin
  * @summary Endpoint for editing image
	* @tags Image
	* @param {string} image.query.required - the URL of the image to edit
  * @return {object} 200 - success response - application/json
*/
router.get('/whowouldwin', checkImage, async (req, res) => {

});
module.exports = router;
