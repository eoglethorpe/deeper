import store from './common/store';
import { setTokenAction } from './common/redux';

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
        const token = request.token;
        store.dispatch(setTokenAction({ token }));
        reply({ message: 'success' });
    }

    return false;
});
