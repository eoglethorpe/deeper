const userGroupSchema = [];

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
export default userGroupSchema;
