import { Router } from 'express';
import { fetchUsers } from '../database/User';
import { fetchEndpointData } from '../database/endpointData';
import { checkAdmin } from '../middleware/middleware';

const router = Router();

export default function() {

	// home page
	router.get('/', checkAdmin, async (req, res) => {
		const [users, endpoints] = await Promise.all([fetchUsers(), fetchEndpointData()]);

		res.render('admin', {
			user: req.isAuthenticated() ? req.user : null,
			users, endpoints,
		});
	});

	return router;
}
