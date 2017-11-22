const tokenSchema = [];

{
    const name = 'accessToken';
    const schema = {
        doc: {
            name: 'Access Token',
            description: 'Data decoded from access token',
        },
        fields: {
            userId: { type: 'uint', required: 'true' },
            tokenType: { type: 'string', required: 'true' },
            username: { type: 'string', required: 'true' },
            displayName: { type: 'string', required: 'true' },
            exp: { type: 'uint', required: 'true' },
            isSuperuser: { type: 'boolean', required: true },
        },
    };
    tokenSchema.push({ name, schema });
}
{
    const name = 'tokenGetResponse';
    const schema = {
        doc: {
            name: 'Token Get Response',
            description: 'Response for POST /token/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
            refresh: { type: 'string', required: 'true' },
        },
    };
    tokenSchema.push({ name, schema });
}
{
    const name = 'tokenRefreshResponse';
    const schema = {
        doc: {
            name: 'Token Refresh Response',
            description: 'Response for POST /token/refresh/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
        },
    };
    tokenSchema.push({ name, schema });
}
export default tokenSchema;
