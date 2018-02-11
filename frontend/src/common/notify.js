import store from './store';

import { notifySendAction } from './redux';

import { NOTIFICATION } from '../public/components/View/Toast';

const notify = {
    type: NOTIFICATION,
    duration: {
        SLOW: 5000,
        MEDIUM: 3000,
        FAST: 1500,
    },

    // NOTE: no need to use strings here
    defaultNotification: {
        type: NOTIFICATION.INFO,
        title: 'Test notification',
        message: 'This is a test notification',
        dismissable: true,
        duration: 2000,
    },

    send: (notification = {}) => {
        const toastNotification = {
            ...notify.defaultNotification,
            ...notification,
        };

        store.dispatch(notifySendAction({ notification: toastNotification }));
    },
};

export default notify;
