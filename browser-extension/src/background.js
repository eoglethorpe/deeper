const getWebsiteFromUrl = (url) => {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const website = `${protocol}//${host}`;
    return website;
};

// TODO: make common constant for webpage as well
const EXTENSION_GET_SCREENSHOT = 'get-screenshot';
const EXTENSION_SET_TOKEN = 'set-token';
const EXTENSION_SET_TOKEN_FG = 'set-token-fg';
const EXTENSION_GET_TOKEN = 'get-token';

// Message handler for messages from external source (eg: from website, other extension)
chrome.runtime.onMessageExternal.addListener((request, sender, reply) => {
    if (request.message === EXTENSION_GET_SCREENSHOT) {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            reply({
                message: 'success',
                image,
            });
        });

        // return true to indicate that the reply is async
        return true;
    }

    if (request.message === EXTENSION_SET_TOKEN) {
        const { token } = request;
        const senderWebsite = getWebsiteFromUrl(sender.url);
        chrome.storage.local.set({
            [`token ${senderWebsite}`]: token,
        }, () => {
            const newRequest = {
                message: EXTENSION_SET_TOKEN_FG,
                sender: senderWebsite,
                token,
            };
            chrome.runtime.sendMessage(newRequest);
            reply({ message: 'success' });
        });
        return true;
    }

    return false;
});

const emptyObject = {};

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (chrome.runtime.id === sender.id) {
        // Acknowledge token request
        if (request.message === EXTENSION_GET_TOKEN) {
            const website = request.website;
            chrome.storage.local.get(`token ${website}`, (token = emptyObject) => {
                reply(token[`token ${website}`]);
            });
            return true;
        }

        return false;
    }

    return false;
});
