import fs from 'node:fs';
import doctrine from 'doctrine';
import { Utils } from '../utils/Utils';
import { join } from 'path';
import type { APIEndpointData, ParamAPIEndpoint } from '../utils/types';

type encoding = 'utf8' | undefined

function extractAnnotations(filePath: string, encoding: encoding = 'utf8') {
	const fileContent = fs.readFileSync(filePath, { encoding }),
		jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm,
		jsdoc = [];
	let regexResults = null;

	regexResults = fileContent.match(jsDocRegex) || [];
	for (const result of regexResults) {
		jsdoc.push(result);
	}

	return { jsdoc };
}

function sanitiseString(string: string) {
	return string.replace(/\s+/g, ' ').trim();
}

function getParameters(comment: string[]): Array<ParamAPIEndpoint> {
	// Parse parameters
	let finalParams = [];
	if (comment.indexOf('parameters:') != -1) {
		const firstValue = comment.indexOf('parameters:');
		const lastValue = comment.indexOf('responses:');
		const parameters: Array<string> = comment.slice(firstValue + 1, lastValue);

		finalParams = parameters.reduce((resultArray: Array<any>, item, index) => {
			const chunkIndex = Math.floor(index / 4);

			if (!resultArray[chunkIndex]) resultArray[chunkIndex] = [];

			resultArray[chunkIndex].push(item);

			return resultArray;
		}, []);
	}

	const temp: Array<ParamAPIEndpoint> = [];
	for (const t of finalParams) {
		temp.push(parseParameters(t));
	}
	return temp;
}

function parseData(data: string[]): APIEndpointData {
	// Remove any thing past the parameter line
	data = data.indexOf('parameters:') === -1 ? data : data.splice(0, data.indexOf('parameters:'));

	// Parse method
	let method = 'GET';
	switch (data[1]) {
		case 'post:':
			method = 'POST';
			break;
		case 'patch:':
			method = 'PATCH';
			break;
		default:
			method = 'GET';
	}

	// TODO Parse responses

	// Return the data
	return {
		endpoint: data[0],
		method: method,
		description: data[2].split(': ')[1],
		tag: data[3].split(': ')[1],
		responses: [],
	};
}


function parseParameters(para: any): ParamAPIEndpoint {
	const data: ParamAPIEndpoint = {};
	for (const line of para) {
		const [key, value] = line.split(':');
		switch (key) {
			case '- name':
				data.name = sanitiseString(value);
				break;
			case 'description':
				data.description = sanitiseString(value);
				break;
			case 'required':
				data.required = (sanitiseString(value) === 'true');
				break;
			case 'type':
				data.type = sanitiseString(value);
				break;
			default:
				throw new Error(`Unknown values: ${line}`);
		}
	}

	return data;
}


export default function build() {
	const endpoints = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');

	const jsDocs = [];
	for (const filePath of endpoints.map(i => i.path)) {
		const { jsdoc: jsdocAnnotations } = extractAnnotations(filePath);

		if (jsdocAnnotations.length) {
			for (const annotation of jsdocAnnotations) {
				const jsDocComment = doctrine.parse(annotation, { unwrap: true });
				// Cut eachline into an item of array and remove extra spaces
				let newComment = jsDocComment.tags[0].description?.split('\n') ?? [];
				newComment = newComment?.map(i => sanitiseString(i));

				// Parse the data and parse parameters
				const data = parseData(newComment);
				data.parameters = getParameters(newComment);

				// Push the new data to jsDoc array
				jsDocs.push(data);
			}
		}

		// console.dir(jsDocs, { depth: null });
	}

	return jsDocs;
}
