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
    const name = 'userLoginResponse';
    const schema = {
        doc: {
            name: 'User Login Response',
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

{
    const name = 'getUserResponse';
    const schema = {
        doc: {
            name: 'User Object',
            description: 'Response for GET /user/:id/',
        },
        fields: {
            id: { type: 'uint', required: true },
            email: { type: 'email', required: true },
            username: { type: 'string', required: true },
            firstName: { type: 'string', required: true },
            lastName: { type: 'string', required: true },
            displayPicture: { type: 'string' },
            organization: { type: 'string', required: true },
        },
    };
    dict.put(name, schema);
}

export default dict;
export { RavlError } from '../vendor/ravl/error';
