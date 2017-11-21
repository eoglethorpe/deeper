const regionSchema = [];

{
    const name = 'region';
    const schema = {
        doc: {
            name: 'Region',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            adminLevels: { type: 'array.object', required: false },
            code: { type: 'string', required: true },
            keyFigures: { type: 'object', required: false },
            mediaSources: { type: 'object', required: false },
            populationData: { type: 'object', required: false },
            public: { type: 'boolean', required: true },
            regionalGroups: { type: 'object', required: false },
            title: { type: 'string', required: true },
        },
    };
    regionSchema.push({ name, schema });
}

{
    const name = 'regionsGetResponse';
    const schema = {
        doc: {
            name: 'Regions Get Response',
            description: 'Response for GET /regions/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.region', required: true },
        },
    };
    regionSchema.push({ name, schema });
}

{
    const name = 'regionCreateResponse';
    const schema = {
        doc: {
            name: 'Region Post Response',
            description: 'Response for Post',
        },
        extends: 'region',
    };
    regionSchema.push({ name, schema });
}
{
    const name = 'regionPatchResponse';
    const schema = {
        doc: {
            name: 'Region Post Response',
            description: 'Response for Post',
        },
        extends: 'region',
    };
    regionSchema.push({ name, schema });
}

export default regionSchema;
