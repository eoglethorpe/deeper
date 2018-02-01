import createReducerWithMap from '../utils/createReducerWithMap';
import initialNotifyState from '../initial-state/notify';

// TYPE

export const NOTIFY_SEND_ACTION = 'notify/SEND';
export const NOTIFY_HIDE_ACTION = 'notify/HIDE';

// ACTION-CREATOR

export const notifySendAction = ({ notification }) => ({
    type: NOTIFY_SEND_ACTION,
    notification,
});

export const notifyHideAction = () => ({
    type: NOTIFY_HIDE_ACTION,
});

// REDUCER

const notifySend = (state, action) => {
    const newState = [...state];
    newState.notifications = [action.notification];

    return newState;
};

const notifyHide = (state) => {
    const newState = [...state];
    newState.notifications = [];

    return newState;
};

export const notifyReducers = {
    [NOTIFY_SEND_ACTION]: notifySend,
    [NOTIFY_HIDE_ACTION]: notifyHide,
};

const notifyReducer = createReducerWithMap(notifyReducers, initialNotifyState);
export default notifyReducer;
