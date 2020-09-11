import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	ILoadOptionsFunctions
} from 'n8n-core';

import { IDataObject } from 'n8n-workflow';

export async function opsGenieApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, query: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = this.getCredentials('OpsGenieApi');

	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	const endpoint = 'api.opsgenie.com/v2';

	let options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `GenieKey ${credentials.apiKey}`,
		},
		method,
		body,
		qs: query,
		uri: uri || `https://${endpoint}${resource}`,
		json: true
	};
	if (!Object.keys(body).length) {
		delete options.body;
	}
	if (!Object.keys(query).length) {
		delete options.qs;
	}
	options = Object.assign({}, options, option);
	try {
		return await this.helpers.request!(options);
	} catch (error) {
		if (error.response) {
			let errorMessage = error.response.body.message || error.response.body.description || error.message;
			if (error.response.body && error.response.body.errors) {
				errorMessage = error.response.body.errors.map((err: IDataObject) => `"${err.field}" => ${err.message}`).join(', ');
			}
			throw new Error(`OpsGenie error response [${error.statusCode}]: ${errorMessage}`);
		}

		throw error;
	}
}

export function validateJSON(json: string | undefined): any { // tslint:disable-line:no-any
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = [];
	}
	return result;
}

export function capitalize(s: string): string {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
