import type { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';
import { fetchUser } from '../database/User';

/**
	* Check if an image was sent with the request
	* @param req The endpoint the user is trying to access
	* @param res The user trying to access the endpoint
	* @param next The user trying to access the endpoint
	* @returns Whether or not they are being ratelimited
*/
export function checkImage(req: Request, res: Response, next: NextFunction) {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });
	next();
}

export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
	// Make sure user is logged in and isAdmin
	if (req.isAuthenticated()) {
		const user = await fetchUser((req.user as User).id);
		if (user?.isAdmin) return next();
	}

	return res.redirect('/login');
}
