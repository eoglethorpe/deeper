const connectorsSchema = [];

{
    const name = 'connector';
    const schema = {
        doc: {
            name: 'Connectors',
            description: 'One of the main entities for lead add',
        },
        extends: 'dbentity',
        fields: {
            title: { type: 'string', required: true },
            source: { type: 'string', required: true },
            projects: { type: 'array', required: true },
            users: { type: 'array', required: true },
        },
    };
    connectorsSchema.push({ name, schema });
}
{
    const name = 'connectors';
    const schema = {
        doc: {
            name: 'Connectors Get Response',
            description: 'Response for GET /connectors/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.connector', required: true },
        },
    };
    connectorsSchema.push({ name, schema });
}
{
    const name = 'connectorSource';
    const schema = {
        doc: {
            name: 'Connector Source',
            description: 'Different sources for connectors',
        },
        fields: {
            title: { type: 'string', required: true },
            key: { type: 'string', required: true },
            options: { type: 'array', required: true },
        },
    };
    connectorsSchema.push({ name, schema });
}
{
    const name = 'connectorSources';
    const schema = {
        doc: {
            name: 'Connector Sources Get Response',
            description: 'Response for GET /connector-sources/',
        },
        fields: {
            count: { type: 'uint', required: true },
            results: { type: 'array.connectorSource', required: true },
        },
    };
    connectorsSchema.push({ name, schema });
}
export default connectorsSchema;
