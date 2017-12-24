import store from './store';

import { notifySendAction } from './redux';

import {
    NOTIFICATION,
} from '../public/components/View';

const notify = {
    type: NOTIFICATION,

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
