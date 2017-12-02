import {
    SET_NAVBAR_STATE,
    SET_BLOCK_UI,
} from '../action-types/navbar';

import initialNavbarState from '../initial-state/navbar';
import update from '../../public/utils/immutable-update';

const setNavbarState = (state, action) => {
    const { visible, activeLink, validLinks } = action;
    const settings = {
        visible: { $set: visible },
        activeLink: { $set: activeLink },
        validLinks: { $set: validLinks },
    };
    return update(state, settings);
};

const setBlockUI = (state, action) => {
    const { blockUI } = action;
    const settings = {
        blockUI: { $set: blockUI },
    };
    return update(state, settings);
};

const reducers = {
    [SET_NAVBAR_STATE]: setNavbarState,
    [SET_BLOCK_UI]: setBlockUI,
};

const navbarReducer = (state = initialNavbarState, action) => {
    const { type } = action;
    const reducer = reducers[type];
    if (!reducer) {
        return state;
    }
    return reducer(state, action);
};

export default navbarReducer;
