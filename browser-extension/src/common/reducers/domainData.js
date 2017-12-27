// import jwtDecode from 'jwt-decode';
// import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
// import schema from '../../common/schema';
import initialDomainDataState from '../initial-state/domainData';

// TYPE

// export const LOGIN_ACTION = 'auth/LOGIN';

// ACTION-CREATOR

/*
export const loginAction = ({ access, refresh }) => ({
    type: LOGIN_ACTION,
    access,
    refresh,
});
*/

// REDUCER

/*
const login = (state, action) => {
    const { access, refresh } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: { $set: {
            access,
            refresh,
        } },
        activeUser: { $set: decodedToken },
    };
    return update(state, settings);
};
*/


export const domainDataReducers = {
    // [LOGIN_ACTION]: login,
};

const domainDataReducer = createReducerWithMap(domainDataReducers, initialDomainDataState);
export default domainDataReducer;
