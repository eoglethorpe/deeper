import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    SET_ACCESS_TOKEN_ACTION,
    SET_CURRENT_USER_ACTION,
} from '../action-types/auth';

import initialAuthState from '../initial-state/auth';
import update from '../../public/utils/immutable-update';

const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case LOGIN_ACTION: {
            const settings = {
                authenticated: { $set: true },
                token: { $set: {
                    access: action.access,
                    refresh: action.refresh,
                } },
                user: { $set: {
                    email: action.email,
                } },
            };
            return update(state, settings);
        }
        case LOGOUT_ACTION: {
            const settings = {
                authenticated: { $set: false },
                token: { $set: {} },
                user: { $set: {} },
            };
            return update(state, settings);
        }
        case SET_ACCESS_TOKEN_ACTION: {
            const settings = {
                token: { $merge: {
                    access: action.access,
                } },
            };
            return update(state, settings);
        }
        case SET_CURRENT_USER_ACTION: {
            const settings = {
                user: { $set: action.user },
            };
            return update(state, settings);
        }

        default:
            return state;
    }
};

export default authReducer;
