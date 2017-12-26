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

export default categoryEditorSchema;
