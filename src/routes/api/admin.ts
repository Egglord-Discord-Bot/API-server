import { Router } from 'express';
import { checkAdmin } from '../../middleware/middleware';
import { fetchUser, updateUser } from '../../database/User';
import { updateEndpointData } from '../../database/endpointData';
const router = Router();

export default function() {

	/**
	 * @API
	 * /admin/user:
	 *   patch:
	 *     description: Update a users information
	 *     tags: info
	 *			parameters:
 	 *       - name: userId
   *         description: The ID of the user
   *         required: true
   *         type: string
	 */
	router.patch('/user', checkAdmin, async (req, res) => {
		// Get userID
		const userID = req.query.userId;
		if (!userID) return res.json({ error: 'Missing userId query.' });

		// Fetch user by ID
		const user = await fetchUser(userID as string);
		if (!user) return res.json({ error: 'User not found with that ID' });

		try {
			await updateUser(Object.assign({ id: user.id }, req.body));
		} catch(err: any) {
			console.log(err);
			res.json({ err: err.message });
		}
	});

	/**
	 * @API
	 * /admin/endpoint:
	 *   patch:
	 *     description: Update a users information
	 *     tags: info
	 *			parameters:
	 *       - name: endpoint
	 *         description: The name of the endpoint
	 *         required: true
	 *         type: string
	 */
	router.patch('/endpoint', checkAdmin, async (req, res) => {
		try {
			await updateEndpointData(Object.assign({ name: 'stuff' }, req.body));
		} catch (err) {
			console.log(err);
			res.json({ err });
		}
	});


	return router;
}
