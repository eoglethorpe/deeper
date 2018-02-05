const userSchema = [];

// Email types changed to string because large number of
// migrated users do not have valid email

{
    const name = 'user-s';
    const schema = {
        doc: {
            name: 'User Small',
            description: 'Data for Small User Information',
        },
        fields: {
            displayName: { type: 'string', required: true },
            email: { type: 'string', required: true },
            id: { type: 'uint', required: true },
        },
    };
    userSchema.push({ name, schema });
}
{
    const name = 'user';
    const schema = {
        doc: {
            name: 'User',
            description: 'Data for user',
        },
        extends: 'user-s',
        fields: {
            displayName: { type: 'string', required: true },
            displayPicture: { type: 'uint' }, // id
            email: { type: 'string', required: true },
            firstName: { type: 'string', required: true },
            id: { type: 'uint', required: true },
            lastName: { type: 'string', required: true },
            organization: { type: 'string', required: true },
            username: { type: 'string', required: true },
        },
    };
    userSchema.push({ name, schema });
}

{
    const name = 'userCreateResponse';
    const schema = {
        doc: {
            name: 'User Create Response',
            description: 'Response for POST /users/',
            note: 'This is the first schema',
        },
        extends: 'user',
    };
    userSchema.push({ name, schema });
}
{
    const name = 'usersGetResponse';
    const schema = {
        doc: {
            name: 'User Get Response',
            description: 'Response for GET /users/:id/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.user-s', required: true },
        },
    };
    userSchema.push({ name, schema });
}
{
    const name = 'userGetResponse';
    const schema = {
        doc: {
            name: 'Users Get Response',
            description: 'Response for GET /users/',
        },
        extends: 'user',
    };
    userSchema.push({ name, schema });
}
{
    const name = 'userPatchResponse';
    const schema = {
        doc: {
            name: 'User Patch Response',
            description: 'Response for PATCH /user/:id/',
        },
        extends: 'user',
    };
    userSchema.push({ name, schema });
}
{
    const name = 'userPasswordResetResponse';
    const schema = {
        doc: {
            name: 'User Password Rest Response',
            description: 'Response for POST /password/reset/',
        },
        fields: {
            email: { type: 'string', required: true },
        },
    };
    userSchema.push({ name, schema });
}
export default userSchema;
