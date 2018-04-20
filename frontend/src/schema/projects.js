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
            regions: { type: 'array.object' },
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
            analysisFramework: { type: 'uint', required: false },
            assessmentTemplate: { type: 'uint', required: false },
            categoryEditor: { type: 'uint', required: false },
            userGroups: { type: 'array.userGroupBase' },
            startDate: { type: 'string' }, // date
            endDate: { type: 'string' }, // date
            role: { type: 'string', required: true },
            extra: { type: 'projectsExtra', required: false },
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
            memberEmail: { type: 'email' },
            project: { type: 'uint', required: true },
            role: { type: 'string' }, // enum: normal, admin
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMini';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities, used only for title and id',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            role: { type: 'string', required: true },
            assessmentTemplate: { type: 'uint', required: false },
            versionId: { type: 'uint', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectOptionsGetResponse';
    const schema = {
        doc: {
            name: 'Project Options',
            description: 'Defines response of project options: regions and usergroups',
        },
        fields: {
            regions: { type: 'array.keyValuePair', required: true },
            userGroups: { type: 'array.keyValuePair', required: true },
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
    const name = 'projectsExtra';
    const schema = {
        doc: {
            name: 'Extra fields for projects Get Response',
        },
        fields: {
            lastActiveProject: { type: 'uint' },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectsMiniGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/ for title and Id only',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.projectMini', required: true },
            extra: { type: 'projectsExtra', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
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
            results: { type: 'array.project', required: true },
            extra: { type: 'projectsExtra', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectCreateResponse';
    const schema = {
        doc: {
            name: 'Projects Create Response',
            description: 'Response for POST /projects/',
        },
        extends: 'project',
    };
    projectSchema.push({ name, schema });
}
{
    const name = 'projectMembershipCreateResponse';
    const schema = {
        doc: {
            name: 'Project Membership POST Response',
            description: 'Response for POST /project-memberships/',
        },
        fields: {
            results: { type: 'array.projectMembership', required: true },
        },
    };
    projectSchema.push({ name, schema });
}
export default projectSchema;
