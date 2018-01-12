const exportSchema = [];

{
    const name = 'export';
    const schema = {
        doc: {
            name: 'Export',
            description: 'Attributes after any export',
        },
        fields: {
            exportedAt: { type: 'string', required: true }, // date
            exportedBy: { type: 'uint', required: true },
            file: { type: 'string' },
            format: { type: 'string' },
            id: { type: 'uint', required: true },
            mimeType: { type: 'string', required: true },
            pending: { type: 'boolean', required: true },
            title: { type: 'string', required: true },
            type: { type: 'string', required: true },
        },
    };
    exportSchema.push({ name, schema });
}
{
    const name = 'userExportsGetResponse';
    const schema = {
        doc: {
            name: 'User Exports Get Response',
            description: 'Response for GET /exports/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.export', required: true },
        },
    };
    exportSchema.push({ name, schema });
}

export default exportSchema;
