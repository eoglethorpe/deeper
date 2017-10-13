import jwtDecode from 'jwt-decode';

import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    SET_ACCESS_TOKEN_ACTION,
} from '../action-types/auth';
import initialAuthState from '../initial-state/auth';
import update from '../../public/utils/immutable-update';
import schema from '../../common/schema';

const decodeAccessToken = (access) => {
    const decodedToken = jwtDecode(access);
    try {
        schema.validate(decodedToken, 'accessToken');
        return {
            userId: decodedToken.userId,
            username: decodedToken.username,
            displayName: decodedToken.displayName,
            exp: decodedToken.exp,
        };
    } catch (ex) {
        console.warn('Access token schema has changed.');
        return {};
    }
};

const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case LOGIN_ACTION: {
            const decodedToken = decodeAccessToken(action.access);
            const settings = {
                authenticated: { $set: true },
                token: { $set: {
                    access: action.access,
                    refresh: action.refresh,
                } },
                activeUser: { $set: decodedToken },
            };
            return update(state, settings);
        }
        case LOGOUT_ACTION: {
            const settings = {
                authenticated: { $set: false },
                token: { $set: {} },
                activeUser: { $set: {} },
            };
            return update(state, settings);
        }
        case SET_ACCESS_TOKEN_ACTION: {
            const decodedToken = decodeAccessToken(action.access);
            const settings = {
                token: { $merge: {
                    access: action.access,
                } },
                activeUser: { $set: decodedToken },
            };
            return update(state, settings);
        }
        default:
            return state;
    }
};

export default authReducer;
