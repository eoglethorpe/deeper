import {
    SET_NAVBAR_STATE,
    SET_BLOCK_UI,
} from '../action-types/navbar';

export const setNavbarStateAction = ({ visible, activeLink, validLinks }) => ({
    type: SET_NAVBAR_STATE,
    visible,
    activeLink,
    validLinks,
});

export const setBlockUIAction = blockUI => ({
    type: SET_BLOCK_UI,
    blockUI,
});
