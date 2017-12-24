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
            adminLevels: { type: 'array.adminLevel', required: false },
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
    const name = 'adminLevel';
    const schema = {
        doc: {
            name: 'Admin Levels',
            description: 'One of the main entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            level: { type: 'uint' },
            nameProp: { type: 'string' },
            codeProp: { type: 'string' },
            parentNameProp: { type: 'string' },
            parentCodeProp: { type: 'string' },
            region: { type: 'uint', required: false },
            parent: { type: 'uint' },
            geoShapeFile: { type: 'uint' },
            staleGeoAreas: { type: 'boolean' },
            tolerance: { type: 'number' },
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
{
    const name = 'adminLevelsGetResponse';
    const schema = {
        doc: {
            name: 'Admin Levels GET Response',
            description: 'GET Response for Admin Levels',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'uint' },
            previous: { type: 'uint' },
            results: { type: 'array.adminLevel', required: true },
        },
    };
    regionSchema.push({ name, schema });
}
{
    const name = 'adminLevelPostResponse';
    const schema = {
        doc: {
            name: 'Admin Level POST Response',
            description: 'POST Response for Admin Level',
        },
        extends: 'adminLevel',
    };
    regionSchema.push({ name, schema });
}
{
    const name = 'adminLevelPatchResponse';
    const schema = {
        doc: {
            name: 'Admin Level PATCH Response',
            description: 'PATCH Response for Admin Level',
        },
        extends: 'adminLevel',
    };
    regionSchema.push({ name, schema });
}

export default regionSchema;
