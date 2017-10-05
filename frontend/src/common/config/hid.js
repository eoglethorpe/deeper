const responseType = 'token';
const scope = 'profile';
const state = '12345';

// TODO: Add configs for local, dev and production
// TODO: Add three types of env variable local, dev and production
// instead of just development and production
const clientId = 'deep-local';
const redirectUrl = 'http://localhost:3000/login/';
const hidAuthUrl = 'https://api2.dev.humanitarian.id';

// eslint-disable-next-line
export const hidUrl = `${hidAuthUrl}/oauth/authorize?response_type=${responseType}&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUrl}`;
// https://api2.dev.humanitarian.id/oauth/authorize?response_type=token&client_id=deep-local&scope=profile&state=12345&redirect_uri=http://localhost:8000/login/
