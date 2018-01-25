// export const extensionId = 'nkipfcpknocfnlelgehlealjgknfkfhm'; // fhx
// export const extensionId = 'caebgfaeglddaliobdbkcphpfegnedmp'; // tnagorra
// export const extensionId = 'labjbplogbalfabkboldbkmgigdfblbk'; // bd
export const extensionId = 'kafonkgglonkbldmcigbdojiadfcmcdc'; // extension on store

const EXTENSION_GET_SCREENSHOT = 'screenshot';
const EXTENSION_POST_TOKEN = 'token';

export const getScreenshot = () => {
    const data = {
        message: EXTENSION_GET_SCREENSHOT,
    };

    const promise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(extensionId, data, (response) => {
            if (!response) {
                reject();
            }

            resolve(response);
        });
    });

    return promise;
};

export const sendToken = (token) => {
    const data = {
        message: EXTENSION_POST_TOKEN,
        token,
    };

    const promise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(extensionId, data, (response) => {
            if (!response) {
                reject();
            }
            resolve(response);
        });
    });

    return promise;
};
