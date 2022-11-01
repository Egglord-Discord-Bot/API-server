import { Router } from 'express';
import { checkAdmin } from '../../middleware/middleware';
import { fetchUser, updateUser } from '../../database/User';
const router = Router();

export default function() {

	// home page
	router.patch('/user', checkAdmin, async (req, res) => {
		// Get userID
		const userID = req.query.userId;
		const { isBlocked, isPremium } = req.body;
		if (!userID) return res.json({ error: 'Missing userID query.' });

		// Fetch user by ID
		const user = await fetchUser(userID as string);
		if (!user) return res.json({ error: 'User not found with that ID' });

		try {
			await updateUser({ id: user.id, isBlocked: (isBlocked as boolean), isPremium: (isPremium as boolean) });
		} catch(err) {
			console.log(err);
		}
	});

	return router;
}
