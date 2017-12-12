import dict from '../../vendor/ravl/schema';
import attachValidator from '../../vendor/ravl/attachValidator';

import leads from './leads';
import entries from './entries';
import projects from './projects';
import regions from './regions';
import token from './token';
import userGroups from './userGroups';
import users from './users';
import analysisFrameworks from './analysisFrameworks';

// ATTACHING BEHAVIORS
attachValidator(dict);

// ATTACHING USER DEFINED SCHEMAS

const userDefinedSchemas = [];

// TODO: add errorResponse and successResponse in RestRequest

{
    const name = 'dbentity';
    const schema = {
        doc: {
            name: 'Database Entity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            createdByName: { type: 'string' },
            id: { type: 'uint', required: true },
            modifiedAt: { type: 'string', required: true }, // date
            modifiedBy: { type: 'uint' },
            modifiedByName: { type: 'string' },
            versionId: { type: 'uint', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}
{
    const name = 'keyValuePair';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair',
        },
        fields: {
            key: { type: 'uint', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}

[
    ...userDefinedSchemas,
    ...leads,
    ...entries,
    ...projects,
    ...regions,
    ...token,
    ...userGroups,
    ...users,
    ...analysisFrameworks,
].forEach(({ name, schema }) => dict.put(name, schema));

export default dict;
