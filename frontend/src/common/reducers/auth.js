import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
} from '../action-types/auth';


const initialAuthState = {
    authenticated: false,
    email: undefined,
};

const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case LOGIN_ACTION:
            return {
                ...initialAuthState,
                authenticated: true,
                email: action.email,
            };
        case LOGOUT_ACTION:
            return {
                ...initialAuthState,
                authenticated: false,
                email: undefined,
            };
        default:
            return state;
    }
};

export default authReducer;
