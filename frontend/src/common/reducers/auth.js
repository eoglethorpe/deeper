import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    SET_ACCESS_TOKEN_ACTION,
} from '../action-types/auth';

import initialAuthState from '../initial-state/auth';

const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case LOGIN_ACTION:
            return {
                ...state,
                authenticated: true,
                email: action.email,
                access: action.access,
                refresh: action.refresh,
            };
        case LOGOUT_ACTION:
            return {
                ...state,
                authenticated: false,
                email: undefined,
                access: undefined,
                refresh: undefined,
            };
        case SET_ACCESS_TOKEN_ACTION:
            return {
                ...state,
                access: action.access,
                firstName: 'Frozen',
                lastName: 'Helium',
                displayPicture: 'https://i.imgur.com/yJP07D6.png',
            };
        default:
            return state;
    }
};

export default authReducer;
