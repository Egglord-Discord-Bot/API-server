import type { Request, Response, NextFunction } from 'express';

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
