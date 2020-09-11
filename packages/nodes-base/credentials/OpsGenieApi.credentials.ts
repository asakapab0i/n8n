import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class OpsGenieApi implements ICredentialType {
	name = 'OpsGenieApi';
	displayName = 'OpsGenieApi';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		}
	];
}
