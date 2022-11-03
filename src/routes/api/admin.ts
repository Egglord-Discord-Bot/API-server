import { Router } from 'express';
import { checkAdmin } from '../../middleware/middleware';
import { fetchUser, updateUser } from '../../database/User';
const router = Router();

export default function() {

	// home page
	router.patch('/user', checkAdmin, async (req, res) => {
		// Get userID
		const userID = req.query.userId;
		if (!userID) return res.json({ error: 'Missing userID query.' });

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

	return router;
}
