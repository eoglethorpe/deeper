const regionSchema = [];

{
    const name = 'country';
    const schema = {
        doc: {
            name: 'Country',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            code: { type: 'string', required: true },
            title: { type: 'string', required: true },
            data: { type: 'object', required: false },
            public: { type: 'boolean', required: true },
        },
    };
    regionSchema.push({ name, schema });
}

{
    const name = 'countriesGetResponse';
    const schema = {
        doc: {
            name: 'Countries Get Response',
            description: 'Response for GET /regions/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.country', required: true },
        },
    };
    regionSchema.push({ name, schema });
}

{
    const name = 'regionCreateResponse';
    const schema = {
        doc: {
            name: 'Country Post Response',
            description: 'Response for Post',
        },
        extends: 'country',
    };
    regionSchema.push({ name, schema });
}

export default regionSchema;
