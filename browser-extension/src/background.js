chrome.runtime.onMessageExternal.addListener((request, sender, reply) => {
    if (request.message === 'screenshot') {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            reply({
                message: 'success',
                image,
            });
        });

        // return true to indicate that the reply is async
        return true;
    }

    if (request.message === 'token') {
        chrome.storage.local.set({ token: request.token });
        chrome.runtime.sendMessage({
            message: 'token',
            token: request.token,
        });
        reply({ message: 'success' });
    }

    return false;
});

const emptyObject = {};

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (chrome.runtime.id === sender.id) {
        if (request.message === 'token') {
            chrome.storage.local.get('token', (token = emptyObject) => {
                reply(token);
            });
        }
        return true;
    }

    return false;
});
