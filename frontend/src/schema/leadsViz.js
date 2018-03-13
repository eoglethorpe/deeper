const leadsVizSchema = [];

{
    const name = 'leadKeywordCorrelationLink';
    const schema = {
        doc: {
            name: 'Lead Keyword Correlation Link',
            description: 'Lead Keyword Correlation Link',
        },
        fields: {
            source: { type: 'string' },
            value: { type: 'number' },
            target: { type: 'string' },
        },
    };
    leadsVizSchema.push({ name, schema });
}
{
    const name = 'leadKeywordCorrelationNode';
    const schema = {
        doc: {
            name: 'Lead Keyword Correlation Node',
            description: 'Lead Keyword Correlation Node',
        },
        fields: {
            id: { type: 'string' },
            group: { type: 'number' },
        },
    };
    leadsVizSchema.push({ name, schema });
}
{
    const name = 'leadKeywordCorrelationResponse';
    const schema = {
        doc: {
            name: 'Lead Keyword Correlation Response',
            description: 'Lead Keyword Correlation Response',
        },
        fields: {
            links: { type: 'array.leadKeywordCorrelationLink', required: true },
            nodes: { type: 'array.leadKeywordCorrelationNode', required: true },
        },
    };
    leadsVizSchema.push({ name, schema });
}

export default leadsVizSchema;
