import { LOGOUT_ACTION } from '../../action-types/auth';
import { SET_USER_PROJECTS } from '../../action-types/domainData';

import initialSiloDomainData from '../../initial-state/siloDomainData';
import reducers, {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,
    setActiveProjectAction,
    setActiveCountryAction,
} from './common';

test('should set active country', () => {
    const state = {
        activeCountry: 1,
    };
    const action = setActiveCountryAction({
        activeCountry: 2,
    });
    const after = {
        activeCountry: 2,
    };
    expect(reducers[SET_ACTIVE_COUNTRY](state, action)).toEqual(after);
});

test('should set active project', () => {
    const state = {
        activeProject: 1,
    };
    const action = setActiveProjectAction({
        activeProject: 2,
    });
    const after = {
        activeProject: 2,
    };

    expect(reducers[SET_ACTIVE_PROJECT](state, action)).toEqual(after);
});

test('should set active project on new projects', () => {
    // retain, don't retain
    const state = {
        activeProject: 1,
    };
    const action = {
        type: SET_USER_PROJECTS,
        projects: [
            { id: 1 }, { id: 3 },
        ],
    };
    const after = {
        activeProject: 1,
    };
    expect(reducers[SET_USER_PROJECTS](state, action)).toEqual(after);
});

test('should set active project on new projects', () => {
    // retain, don't retain
    const state = {
        activeProject: 1,
    };

    const action = {
        type: SET_USER_PROJECTS,
        projects: [
            { id: 3 }, { id: 2 },
        ],
    };
    const after = {
        activeProject: 3,
    };
    expect(reducers[SET_USER_PROJECTS](state, action)).toEqual(after);
});

test('logout', () => {
    // retain, don't retain
    const state = {
        activeProject: 1,
    };
    const action = {
        type: LOGOUT_ACTION,
    };
    const after = initialSiloDomainData;
    expect(reducers[LOGOUT_ACTION](state, action)).toEqual(after);
});
