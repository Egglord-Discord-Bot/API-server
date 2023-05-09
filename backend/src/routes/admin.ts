import { Router } from 'express';
import { fetchUsers } from '../database/User';
import { fetchEndpointData } from '../database/endpointData';
import { fetchAllEndpointUsage } from '../database/userHistory';
import { checkAdmin } from '../middleware/middleware';

const router = Router();

export default function() {

	// home page
	router.get('/', checkAdmin, async (req, res) => {
		const [users, endpoints, userHistory] = await Promise.all([fetchUsers(), fetchEndpointData(), fetchAllEndpointUsage()]);

		res.render('admin', {
			user: req.isAuthenticated() ? req.user : null,
			users, endpoints, userHistory,
		});
	});

	return router;
}
