const userGroupSchema = [];

{
    const name = 'userGroupBase';
    const schema = {
        doc: {
            name: 'User Group Base',
            description: 'User Group with id and title only',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
        },
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userGroup';
    const schema = {
        doc: {
            name: 'User Group',
            description: 'One of the main entities',
        },
        fields: {
            displayPicture: { type: 'string', required: false },
            globalCrisisMonitoring: { type: 'boolean', required: true },
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            memberships: { type: 'array.userGroupMembership', required: true },
            customProjectFields: { type: 'object' },
        },
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userGroupMembership';
    const schema = {
        doc: {
            name: 'User Group Membership',
            description: 'Defines all mapping between User Group and User',
        },
        fields: {
            member: { type: 'uint', required: true },
            group: { type: 'uint', required: true },
            id: { type: 'uint', required: true },
            memberName: { type: 'string' },
            memberEmail: { type: 'email' },
            role: { type: 'string' }, // enum: normal, admin
            joinedAt: { type: 'string' }, // date
        },
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userGroupsGetResponse';
    const schema = {
        doc: {
            name: 'User Groups Get Response',
            description: 'Response for GET /user-groups/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.userGroup', required: true },
        },
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userGroupCreateResponse';
    const schema = {
        doc: {
            name: 'User Groups POST Response',
            description: 'Response for POST /user-groups/',
        },
        extends: 'userGroup',
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userGroupGetResponse';
    const schema = {
        doc: {
            name: 'User Group Get Response',
            description: 'Response for GET /user-groups/:id',
        },
        extends: 'userGroup',
    };
    userGroupSchema.push({ name, schema });
}
{
    const name = 'userMembershipCreateResponse';
    const schema = {
        doc: {
            name: 'User Membership POST Response',
            description: 'Response for POST /groups-memberships/',
        },
        fields: {
            results: { type: 'array.userGroupMembership', required: true },
        },
    };
    userGroupSchema.push({ name, schema });
}
export default userGroupSchema;
