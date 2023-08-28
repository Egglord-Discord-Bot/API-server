import type { Request, Response } from 'express';
import type { Client } from '../helpers';
import type { ExtendedEndpoint } from '../types/database';
import type { ParamAPIEndpoint } from '../types';
import { Error } from './';

export default class Validator {
	/**
		* Check the requestee's query parameters
		* @param {Client} client The client
		* @param {Request} req The request from requestee
		* @param {Response} res The response to the requestee
		* @returns Success or not
	*/
	public static async checkQuery(client: Client, req: Request, res: Response) {
		const endpoints = await client.EndpointManager.fetchEndpointData();
		const endpoint = endpoints.find(e => e.name == req.originalUrl.split('?')[0]) as ExtendedEndpoint;

		// Check params
		for (const param of endpoint.data?.parameters ?? []) {
			const query = req.query[param.name];
			switch (param.type) {
				case 'string': {
					const resp = this.checkString(res, param, query);
					if (typeof resp != 'boolean') return null;
				}
					break;
				case 'number': {
					const resp = this.checkNumber(res, param, query);
					console.log(typeof resp != 'boolean');
					if (typeof resp != 'boolean') return null;
				}
					break;
				default:
					client.Logger.error(`${param.type} has not been included in the validator.`);
					return { success: true };
			}
		}

		return { success: true };
	}

	/**
		* Check if the query parameter is a valid string
		* @param {Response} res The response to the requestee
		* @param {ParamAPIEndpoint} res The parameter data
		* @param {unknown} query The query to check
		* @returns Success or not
	*/
	public static checkString(res: Response, param: ParamAPIEndpoint, query: unknown) {
		// First check if it's a string
		if (typeof query !== 'string' && param.required) return Error.IncorrectType(res, param.name, 'string');

		// Check if only certain values can be used (enums)
		const enums = param.enum;
		if ((enums && enums.length > 0) && !enums.includes(query as string)) return Error.InvalidValue(res, param.name, enums);

		return true;
	}

	/**
		* Check if the query parameter is a valid number
		* @param {Response} res The response to the requestee
		* @param {ParamAPIEndpoint} res The parameter data
		* @param {unknown} query The query to check
		* @returns Success or not
	*/
	public static checkNumber(res: Response, param: ParamAPIEndpoint, query: unknown) {
		// First check if it's a number
		if (!Number.isInteger(query) && param.required) return Error.IncorrectType(res, param.name, 'number');

		// Check if only certain values can be used (enums)
		const enums = param.enum;
		if ((enums && enums.length > 0) && !enums.includes(query as string)) return Error.InvalidValue(res, param.name, enums);

		// Check for max and min numbers
		if ((param.maximum && param.minimum) && (Number(query) <= param.minimum || Number(query) >= param.maximum)) return Error.InvalidRange(res, 'port', [param.minimum, param.maximum]);

		return true;
	}
}
