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
        chrome.runtime.sendMessage({
            message: 'token',
            token: request.token,
        });
        reply({ message: 'success' });
    }

    return false;
});
