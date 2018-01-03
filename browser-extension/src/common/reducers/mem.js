import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
import initialMemState from '../initial-state/mem';

// TYPE

export const SET_CURRENT_TAB_INFO_ACTION = 'mem/SET_CURRENT_TAB_INFO';

// ACTION-CREATOR

export const setCurrentTabInfoAction = ({ tabId, url }) => ({
    type: SET_CURRENT_TAB_INFO_ACTION,
    tabId,
    url,
});


// REDUCER

const setCurrentTabInfo = (state, action) => {
    const {
        tabId,
        url,
    } = action;

    const settings = {
        currentTabId: {
            $set: tabId,
        },
        currentTabUrl: {
            $set: url,
        },
    };

    const newState = update(state, settings);

    return newState;
};


export const memReducers = {
    [SET_CURRENT_TAB_INFO_ACTION]: setCurrentTabInfo,
};

const memReducer = createReducerWithMap(memReducers, initialMemState);
export default memReducer;
