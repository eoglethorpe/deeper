const leadSchema = [];

{
    const name = 'lead';
    const schema = {
        doc: {
            name: 'Lead',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            sourceType: { type: 'string' }, // set is required later
            assignee: { type: 'array.uint' },
            attachment: { type: 'object' }, // file url
            confidentiality: { type: 'string', required: true },
            assessment: { type: 'uint' },
            noOfEntries: { type: 'int' },
            project: { type: 'uint' },
            publishedOn: { type: 'string' },
            source: { type: 'string' }, // url
            status: { type: 'string', required: true },
            text: { type: 'string' },
            title: { type: 'string', required: true },
            url: { type: 'string' },
            website: { type: 'string' },
            classifiedDocId: { type: 'number' },
        },
    };
    leadSchema.push({ name, schema });
}
{
    const name = 'leadClassifiedDocumentId';
    const schema = {
        doc: {
            name: 'Lead Classifed Document ID',
            description: 'Lead with Classifed Document ID',
        },
        fields: {
            classifiedDocId: { type: 'number' },
        },
    };
    leadSchema.push({ name, schema });
}
{
    const name = 'leadsGetResponse';
    const schema = {
        doc: {
            name: 'Lead Get Response',
            description: 'Response for GET /leads/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.lead', required: true },
        },
    };
    leadSchema.push({ name, schema });
}
{
    const name = 'leadsCDIdGetResponse';
    const schema = {
        doc: {
            name: 'Lead Classified Doc Id GET Response',
            description: 'Response for GET /leads/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.leadClassifiedDocumentId', required: true },
        },
    };
    leadSchema.push({ name, schema });
}

{
    const name = 'projectLeadFilterOptions';
    const schema = {
        doc: {
            name: 'Project Lead Filter Options',
            description: 'Filter options of leads for project',
        },
        fields: {
            assignee: { type: 'array.keyValuePair' },
            status: { type: 'array.keyValuePairSS' },
            project: { type: 'array.keyValuePair' },
            confidentiality: { type: 'array.keyValuePairSS' },
        },
    };
    leadSchema.push({ name, schema });
}

export default leadSchema;
