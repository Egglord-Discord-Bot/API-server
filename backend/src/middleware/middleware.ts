import type { Request, Response, NextFunction } from 'express';
import { Utils, Error } from '../utils';

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
			if (!image) return Error.MissingQuery(res, `image${NumberofImages}`);
		}

		next();
	};
}

/**
	* Check if a user is logged in and is an admin
	* @param {Request} req endpoint the user is trying to access
	* @param {Response} res endpoint the user is trying to access
	* @param {NextFunction} next endpoint the user is trying to access
	* @returns Whether or not the request is an admin
*/
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
	// Check if user is logged in and is admin
	const ses = await Utils.getSession(req);
	if (ses?.user.role == 'ADMIN') return next();

	// If not they are logged in or an admin
	return Error.MissingAccess(res);
}
