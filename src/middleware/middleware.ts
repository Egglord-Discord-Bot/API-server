import type { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';
import { fetchUser } from '../database/User';

/**
	* Check if an image was sent with the request
	* @param {Int} NumberofImages endpoint the user is trying to access
	* @returns Whether or not they are being ratelimited
*/
export function checkImage(NumberofImages: number) {
	return (req: Request, res: Response, next: NextFunction) => {
		// Make sure enough images have been sent aswell
		for (let i = 1; i <= NumberofImages; i++) {
			const image = req.query[`image${NumberofImages}`];
			if (!image) return res.json({ error: `Missing image${NumberofImages} in query` });
		}

		next();
	};
}


export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
	// Make sure user is logged in and isAdmin
	if (req.isAuthenticated()) {
		const user = await fetchUser((req.user as User).id);
		if (user?.isAdmin) return next();
	}

	return res.redirect('/login');
}
