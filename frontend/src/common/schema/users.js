const userSchema = [];

{
    const name = 'user-s';
    const schema = {
        doc: {
            name: 'User Small',
            description: 'Data for Small User Information',
        },
        fields: {
            displayName: { type: 'string', required: true },
            email: { type: 'email', required: true },
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
            email: { type: 'email', required: true },
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
        /*
        validator: (self, context) => {
            if (isFalsy(self.token)) {
                return;
            }
            if (self.token.length <= 5) {
                throw new RavlError('Length must be greater than 5', context);
            }
        },
        */
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

export default userSchema;
