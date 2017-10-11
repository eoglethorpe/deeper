// ERRORS
// import { RavlError } from '../vendor/ravl/error';
// import { isFalsy } from '../vendor/ravl//common';
import attachValidator from '../vendor/ravl/attachValidator';
import dict from '../vendor/ravl/schema';

// TODO: add errorResponse and successResponse in RestRequest

// ATTACHING BEHAVIORS
attachValidator(dict);

// ATTACHING USER DEFINED SCHEMAS
{
    const name = 'accessToken';
    const schema = {
        doc: {
            name: 'Access Token',
            description: 'Data decoded from access token',
        },
        fields: {
            userId: { type: 'uint', required: 'true' },
            tokenType: { type: 'string', required: 'true' },
            username: { type: 'string', required: 'true' },
            displayName: { type: 'string', required: 'true' },
            exp: { type: 'uint', required: 'true' },
        },
    };
    dict.put(name, schema);
}


// User related requests
{
    const name = 'userCreateResponse';
    const schema = {
        doc: {
            name: 'User Create Response',
            description: 'Response for POST /users/',
            note: 'This is the first schema',
        },
        fields: {
            pk: { type: 'unit', required: true },
            displayPicture: { type: 'string' },
            organization: { type: 'string' },
            email: { type: 'email', required: true },
            firstName: { type: 'string', required: true },
            lastName: { type: 'string', required: true },
            username: { type: 'string', required: true },
        },
        /*
        validator: (self, context) => {
            if (isFalsy(self.token)) {
                return;
            }
            if (self.token.length <= 5) {
                throw new RavlError('Length must be greater than 5', context);
            }
        },
        */
    };
    dict.put(name, schema);
}
{
    const name = 'userGetResponse';
    const schema = {
        doc: {
            name: 'User Get Response',
            description: 'Response for GET /user/:id/',
        },
        fields: {
            id: { type: 'uint', required: true },
            email: { type: 'email', required: true },
            username: { type: 'string', required: true },
            firstName: { type: 'string', required: true },
            lastName: { type: 'string', required: true },
            displayPicture: { type: 'string' },
            displayName: { type: 'string', required: true },
            organization: { type: 'string', required: true },
        },
    };
    dict.put(name, schema);
}

// Project related requests
{
    const name = 'project';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            createdAt: { type: 'string', required: true }, // change to date later
            modifiedAt: { type: 'string', required: true }, // change to date later
            createdBy: { type: 'uint', required: true },
            modifiedBy: { type: 'uint', required: true },

            title: { type: 'string', required: true },
            members: { type: 'array.uint', required: true },
            memberships: { type: 'array.uint', required: true },
            regions: { type: 'array.uint', required: true },
            userGroups: { type: 'array.uint', required: true },
            data: { type: 'object' },
        },
    };
    dict.put(name, schema);
}

{
    const name = 'projectsGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.project', required: true },
        },
    };
    dict.put(name, schema);
}

// Token related requests
{
    const name = 'tokenGetResponse';
    const schema = {
        doc: {
            name: 'Token Get Response',
            description: 'Response for POST /token/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
            refresh: { type: 'string', required: 'true' },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'tokenRefreshResponse';
    const schema = {
        doc: {
            name: 'Token Refresh Response',
            description: 'Response for POST /token/refresh/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
        },
    };
    dict.put(name, schema);
}

export default dict;
export { RavlError } from '../vendor/ravl/error';
