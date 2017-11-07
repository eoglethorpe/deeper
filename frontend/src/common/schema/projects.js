const projectSchema = [];

{
    const name = 'project';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            data: { type: 'object' },
            memberships: { type: 'array.projectMembership' },
            regions: { type: 'array.uint' },
            title: { type: 'string', required: true },
            userGroups: { type: 'array.uint' },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMembership';
    const schema = {
        doc: {
            name: 'Project Membership',
            description: 'Defines all mapping between Project and User',
        },
        fields: {
            id: { type: 'uint', required: true },
            joinedAt: { type: 'string' }, // date
            member: { type: 'uint', required: true },
            memberName: { type: 'string' },
            project: { type: 'uint', required: true },
            role: { type: 'string' }, // enum: normal, admin
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectList';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectGetResponse';
    const schema = {
        doc: {
            name: 'Project Get Response',
            description: 'Response for GET /projects/{id}',
        },
        extends: 'project',
    };
    projectSchema.push({ name, schema });
}
{
    // FIXME: Extra field(s) present:
    // regions,memberships,userGroups,data,createdAt,createdBy,modifiedAt,
    // modifiedBy,createdByName,modifiedByName'
    const name = 'projectsGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectList', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
export default projectSchema;
