import {
    SET_USER_INFORMATION,
} from '../action-types/domainData';

// eslint-disable-next-line
export const setUserInformationAction = (information) => ({
    type: SET_USER_INFORMATION,
    information,
});
