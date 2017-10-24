import {
    SET_NAVBAR_STATE,
    SET_BLOCK_UI,
} from '../action-types/navbar';

import initialNavbarState from '../initial-state/navbar';
import update from '../../public/utils/immutable-update';

const navbarReducer = (state = initialNavbarState, action) => {
    switch (action.type) {
        case SET_NAVBAR_STATE: {
            const settings = {
                visible: { $set: action.visible },
                activeLink: { $set: action.activeLink },
                validLinks: { $set: action.validLinks },
            };
            return update(state, settings);
        }
        case SET_BLOCK_UI: {
            const settings = {
                blockUI: { $set: action.blockUI },
            };
            return update(state, settings);
        }
        default:
            return state;
    }
};

export default navbarReducer;
