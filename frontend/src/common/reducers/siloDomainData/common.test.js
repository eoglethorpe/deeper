import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,
} from '../../action-types/siloDomainData';
import { LOGOUT_ACTION } from '../../action-types/auth';
import { SET_USER_PROJECTS } from '../../action-types/domainData';

import reducers from './common.js';

test('should set active country', () => {
    const state = {
        activeCountry: 1,
    };

    const action = {
        type: SET_ACTIVE_COUNTRY,
        activeCountry: 2,
    };
    const after = {
        activeCountry: 2,
    };

    expect(reducers[SET_ACTIVE_COUNTRY](state, action)).toEqual(after);
});

test('should set active project', () => {
    const state = {
        activeProject: 1,
    };

    const action = {
        type: SET_ACTIVE_PROJECT,
        activeProject: 2,
    };
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
        activeProject: undefined,
    };
    expect(reducers[SET_USER_PROJECTS](state, action)).toEqual(after);
});
