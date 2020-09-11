import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeTypeDescription,
	INodeExecutionData,
	INodeType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import {
	opsGenieApiRequest
} from './GenericFunctions';


interface ICreateAlertBody {
	message?: string;
	alias?: string;
	description?: string;
	responders?: IDataObject;
	visibleTo?: IDataObject;
	actions?: [string];
	tags?: [string];
	details?: IDataObject;
	entity?: string;
	source?: string;
	priority?: string;
	user?: string;
	note?: string;
}

export class OpsGenie implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpsGenie',
		name: 'OpsGenie',
		group: ['transform'],
		version: 1,
		description: 'N8N OpsGenie integration',
		defaults: {
			name: 'OpsGenie',
			color: '#0D41C6',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'OpsGenieApi',
				required: true,
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				required: true,
				options: [
					{
						name: 'Alert',
						value: 'alert',
					},
				],
				default: 'alert',
				description: 'The resource to operate on.'
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'alert',
						]
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a alert',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an alert',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an alert',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all alerts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an alert',
					},
				],
				default: 'create',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'alert',
						],
						operation: [
							'create',
						]
					},
				},
				default: '',
				description: `Message of the alert`,
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'alert',
						],
						operation: [
							'create',
						]
					},
				},
				default: '',
				description: `Description of the alert`,
			},
			{
				displayName: 'Responder',
				name: 'responder',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				description: 'ID of the user to whom the ticket has been assigned',
			},
		]
	};

	methods = {
		loadOptions: {
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const agents = await opsGenieApiRequest.call(this, 'GET', '/users');
				for (const user of agents.data) {
					const username = user.username;
					const id = user.id;

					returnData.push({
						name: username,
						value: id,
					});
				}
				return returnData;
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items = this.getInputData();
		let responseData;
		const returnData: IDataObject[] = [];
		let item: INodeExecutionData;
		let resource: string;
		let operation: string;

		// Itterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			resource = this.getNodeParameter('resource', itemIndex, '') as string;
			operation = this.getNodeParameter('operation', itemIndex, '') as string;
			item = items[itemIndex];

			item.json['resource'] = resource;
			item.json['operation'] = operation;

			if (resource === 'alert'){
				if (operation === 'create'){
					const message = this.getNodeParameter('message', itemIndex, '') as string;
					const body: ICreateAlertBody = {
						// @ts-ignore
						message: message as string
					};

					responseData = await opsGenieApiRequest.call(this, 'POST', '/alerts', body);
				}
			}

			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				if (responseData === undefined) {
					responseData = { json: {
						success: true,
					} };
				}

				returnData.push(responseData as IDataObject);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
