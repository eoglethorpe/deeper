const analysisFrameworkSchema = [];

{
    const name = 'analysisFramework';
    const schema = {
        doc: {
            name: 'Analysis Framework',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            title: { type: 'string', required: true },
            widgets: { type: 'array.Widget' },
            exportables: { type: 'array.Exportable' },
            filters: { type: 'array.Filter' },
            isAdmin: { type: 'boolean', required: true },
            description: { type: 'string' },
            snapshotOne: { type: 'uint' },
            snapshotTwo: { type: 'uint' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'analysisFrameworkList';
    const schema = {
        doc: {
            name: 'Analysis Frameworks list',
            description: 'One of the main entities',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.analysisFramework', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Widget';
    const schema = {
        doc: {
            name: 'Widget',
            description: 'Widget contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            title: { type: 'string', required: true },
            key: { type: 'string' },
            widgetId: { type: 'string', required: true },
            properties: { type: 'object' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Exportable';
    const schema = {
        doc: {
            name: 'Exportable',
            description: 'Exportable contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            widgetKey: { type: 'string', required: true },
            inline: { type: 'boolean' },
            order: { type: 'uint' },
            data: { type: 'object' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Filter';
    const schema = {
        doc: {
            name: 'Filter',
            description: 'Filter contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            key: { type: 'string', required: true },
            widgetKey: { type: 'string', required: true },
            title: { type: 'string', required: true },
            properties: { type: 'object' },
            filterType: { type: 'string' }, // enum: list, number
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

export default analysisFrameworkSchema;
