const assessmentRegistrySchema = [];

{
    const name = 'aryTemplateMetadataFieldOption';
    const schema = {
        doc: {
            name: 'Ary Template Metadata Field',
            description: 'Ary Template Metadata Field',
        },
        fields: {
            label: { type: 'string' },
            key: { type: 'string', required: true },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryTemplateMetadataField';
    const schema = {
        doc: {
            name: 'Ary Template Metadata Field',
            description: 'Ary Template Metadata Field',
        },
        fields: {
            id: { type: 'uint', required: true },
            fieldType: { type: 'string' },
            options: { type: 'array.aryTemplateMetadataFieldOption', required: true },
            title: { type: 'string' },
        },
    };
    assessmentRegistrySchema.push({ name, schema });
}
{
    const name = 'aryTemplateMetadata';
    const schema = {
        doc: {
            name: 'Ary Template Metadata',
            description: 'Ary Template Metadata',
        },
        fields: {
            id: { type: 'uint', required: true },
            fields: { type: 'array.aryTemplateMetadataField', required: true },
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
            metadataGroups: { type: 'array.aryTemplateMetadata', required: true },
            methodologyGroups: { type: 'array', required: true },
            affectedGroups: { type: 'array', required: true },
            assessmentTopics: { type: 'array', required: true },
        },
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

export default assessmentRegistrySchema;
