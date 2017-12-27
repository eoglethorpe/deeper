import store from './store';

import { notifySendAction } from './redux';

import {
    NOTIFICATION,
} from '../public/components/View';

const notify = {
    type: NOTIFICATION,
    duration: {
        SLOW: 5000,
        MEDIUM: 3000,
        FAST: 1500,
    },

    defaultNotification: {
        type: NOTIFICATION.INFO,
        title: 'Notification',
        message: 'Test notification',
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
