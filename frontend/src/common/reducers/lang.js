import createReducerWithMap from '../utils/createReducerWithMap';
import initialLangState from '../initial-state/lang';

// TYPE

// export const NOTIFY_SEND_ACTION = 'notify/SEND';

// ACTION-CREATOR

/*
export const notifySendAction = ({ notification }) => ({
    type: NOTIFY_SEND_ACTION,
    notification,
});
*/

// REDUCER

/*
const notifySend = (state, action) => {
    const newState = [...state];
    newState.notifications = [action.notification];

    return newState;
};
*/

export const langReducers = {
    // [NOTIFY_SEND_ACTION]: notifySend,
};

const langReducer = createReducerWithMap(langReducers, initialLangState);
export default langReducer;
