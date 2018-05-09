const categoryEditorSchema = [];

{
    const name = 'categoryEditor';
    const schema = {
        doc: {
            name: 'Category Editor',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            title: { type: 'string', required: true },
            isAdmin: { type: 'boolean', required: true },
            projects: { type: 'array.uint' },
            data: { type: 'object' },
        },
    };
    categoryEditorSchema.push({ name, schema });
}
{
    const name = 'categoryEditorList';
    const schema = {
        doc: {
            name: 'Cateory Editor list',
            description: 'One of the main entities',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.categoryEditor', required: true },
        },
    };
    categoryEditorSchema.push({ name, schema });
}
{
    const name = 'keyword';
    const schema = {
        doc: {
            name: 'keyword of classifications',
            description: 'Classification item keyword',
        },
        fields: {
            subcategory: { type: 'string', required: true },
            length: { type: 'uint', required: true },
            start: { type: 'uint', required: true },
        },
    };
    categoryEditorSchema.push({ name, schema });
}
{
    const name = 'categoryEditorClassifyItem';
    const schema = {
        doc: {
            name: 'Cateory Editor classify list',
            description: 'Classification item for assisted tagging',
        },
        fields: {
            title: { type: 'string', required: true },
            keywords: { type: 'array.keyword', required: true },
        },
    };
    categoryEditorSchema.push({ name, schema });
}
{
    const name = 'categoryEditorClassifyList';
    const schema = {
        doc: {
            name: 'Cateory Editor classify list',
            description: 'List of classifications for assisted tagging',
        },
        fields: {
            classifications: { type: 'array.categoryEditorClassifyItem', required: true },
        },
    };
    categoryEditorSchema.push({ name, schema });
}

export default categoryEditorSchema;
