import {
    SET_NAVBAR_STATE,
} from '../action-types/navbar';

// eslint-disable-next-line
export const setNavbarStateAction = ({ visible, activeLink, validLinks }) => ({
    type: SET_NAVBAR_STATE,
    visible,
    activeLink,
    validLinks,
});
