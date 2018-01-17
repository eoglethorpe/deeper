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
        const { token } = request;
        // console.warn('BG: Saving token', token);
        chrome.storage.local.set({ token }, () => {
            const res = {
                message: 'token',
                token,
            };
            // console.warn('BG: Sending to fg', res);
            chrome.runtime.sendMessage(res);
            reply({ message: 'success' });
        });
        return true;
    }

    return false;
});

const emptyObject = {};

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (chrome.runtime.id === sender.id) {
        if (request.message === 'token') {
            chrome.storage.local.get('token', (token = emptyObject) => {
                // console.warn('BG: Replying token', token);
                reply(token);
            });
            return true;
        }
        return false;
    }
    return false;
});
