// export const extensionId = 'nkipfcpknocfnlelgehlealjgknfkfhm'; // fhx
// export const extensionId = 'caebgfaeglddaliobdbkcphpfegnedmp'; // tnagorra
// export const extensionId = 'labjbplogbalfabkboldbkmgigdfblbk'; // bd
export const extensionId = 'kafonkgglonkbldmcigbdojiadfcmcdc'; // extension on store

// TODO: make common constant for extension as well
const EXTENSION_GET_SCREENSHOT = 'get-screenshot';
const EXTENSION_SET_TOKEN = 'set-token';

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
        message: EXTENSION_SET_TOKEN,
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
