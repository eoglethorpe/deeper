const assessmentRegistrySchema = [];

{
    const name = 'aryTemplateFieldOption';
    const schema = {
        doc: {
            name: 'Ary Template Field',
            description: 'Ary Template Field',
        },
        fields: {
            label: { type: 'string' },
            key: { type: 'string', required: true },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryTemplateField';
    const schema = {
        doc: {
            name: 'Ary Template Field',
            description: 'Ary Template Field',
        },
        fields: {
            id: { type: 'uint', required: true },
            tooltip: { type: 'string' },
            fieldType: { type: 'string' },
            options: { type: 'array.aryTemplateFieldOption', required: true },
            title: { type: 'string' },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryTemplateFieldGroup';
    const schema = {
        doc: {
            name: 'Ary Template Field Group',
            description: 'Ary Template Field Group',
        },
        fields: {
            id: { type: 'uint', required: true },
            fields: { type: 'array.aryTemplateField', required: true },
            title: { type: 'string' },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryTemplate';
    const schema = {
        doc: {
            name: 'Analysis Registry Template',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            versionId: { type: 'uint', required: false },
            title: { type: 'string' },
            metadataGroups: { type: 'array.aryTemplateFieldGroup', required: true },
            methodologyGroups: { type: 'array.aryTemplateFieldGroup', required: true },
            sectors: { type: 'array', required: true },
            focuses: { type: 'array', required: true },
            affectedGroups: { type: 'array', required: true },
            prioritySectors: { type: 'array', required: true },
            priorityIssues: { type: 'array', required: true },
            specificNeedGroups: { type: 'array', required: true },
            affectedLocations: { type: 'array', required: true },
            scoreMatrixPillars: { type: 'array', required: true },
            scoreBuckets: { type: 'array', required: true },
            scoreScales: { type: 'array', required: true },
            scorePillars: { type: 'array', required: true },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}

{
    const name = 'ary';
    const schema = {
        doc: {
            name: 'Analysis Registry',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            metadata: { type: 'object' },
            methodology: { type: 'object' },
            summary: { type: 'object' },
            score: { type: 'object' },
            lead: { type: 'uint', required: true },
            leadTitle: { type: 'string' },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryEntryFilterOptions';
    const schema = {
        doc: {
            name: 'Ary Entry Filter Options',
            description: 'Ary Entry Filter Option',
        },
        // FIXME: complete this
        fields: {},
    };
    assessmentRegistrySchema.push({ name, schema });
}

{
    const name = 'aryTemplateGetResponse';
    const schema = {
        doc: {
            name: 'Analysis Registry Template',
            description: 'One of the main entities',
        },
        extends: 'aryTemplate',
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'arysGetResponse';
    const schema = {
        doc: {
            name: 'Analysis Registry List GET Response',
            description: 'Analysis Registry List GET Response',
        },
        fields: {
            count: { type: 'number' },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.ary', required: true },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryGetResponse';
    const schema = {
        doc: {
            name: 'Analysis Registry Get Response',
            description: 'Analysis Registry Get Response',
        },
        extends: 'ary',
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryPutResponse';
    const schema = {
        doc: {
            name: 'Analysis Registry PUT Response',
            description: 'Analysis Registry PUT Response',
        },
        extends: 'ary',
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryPostResponse';
    const schema = {
        doc: {
            name: 'Analysis Registry POST Reponse',
            description: 'Analysis Registry POST Reponse',
        },
        extends: 'ary',
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryEntryFilterOptionsResponse';
    const schema = {
        doc: {
            name: 'Ary Entry Filter Option GET Reponse',
            description: 'Ary Entry Filter Option GET Reponse',
        },
        extends: 'aryEntryFilterOptions',
    };
    assessmentRegistrySchema.push({ name, schema });
}

export default assessmentRegistrySchema;
