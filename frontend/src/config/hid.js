// import { p } from './rest';

const responseType = 'token';
const scope = 'profile';
const state = '12345';

// TODO: Add configs for local, dev and production
// TODO: Add three types of env variable local, dev and production
// instead of just development and production
let clientId = process.env.HID_CLIENT_ID;
let redirectUrl = process.env.HID_CLIENT_REDIRECT_URL;
let hidAuthUrl = process.env.HID_AUTH_URI;

if (process.env.REACT_APP_HID_CLIENT_ID) {
    clientId = process.env.REACT_APP_HID_CLIENT_ID;
    redirectUrl = process.env.REACT_APP_HID_CLIENT_REDIRECT_URL;
    hidAuthUrl = process.env.REACT_APP_HID_AUTH_URI;
} else {
    clientId = 'deep-local';
    redirectUrl = 'http://localhost:3000/login/';
    hidAuthUrl = 'https://api2.dev.humanitarian.id';
}

// NOTE: HID doesn't seem to decode the params, so don't use `p` for now
// eslint-disable-next-line max-len
// export const hidUrl = `${hidAuthUrl}/oauth/authorize?${p({ response_type: responseType, client_id: clientId, scope, state, redirect_url: redirectUrl })}`;
// eslint-disable-next-line import/prefer-default-export
export const hidUrl = `${hidAuthUrl}/oauth/authorize?response_type=${responseType}&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUrl}`;
