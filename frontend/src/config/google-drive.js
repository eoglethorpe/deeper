const getDeveloperKey = () => {
    if (process.env.NODE_ENV === 'development') {
        return 'AIzaSyDINvjHwIS_HHsb3qCgFm_2GFHKqEUwucE';
    }
    return 'AIzaSyBuq0C5lhnpoUkd1Rs80QO0vO5vVRf3SeA';
};

const getClientId = () => {
    if (process.env.NODE_ENV === 'development') {
        return '642927279233-98drcidvhmudgv9dh70m7k66730n9rjr.apps.googleusercontent.com';
    }
    return '642927279233-ht6v3t7h37cc4gjh336sbin6hdlup2vi.apps.googleusercontent.com';
};

export const googleDriveDeveloperKey = getDeveloperKey();
export const googleDriveClientId = getClientId();

export const GOOGLE_SDK_URL = 'https://apis.google.com/js/api.js';
