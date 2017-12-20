import {
    L__SET_LEADS,
    L__SET_FILTER,
    L__UNSET_FILTER,
    L__SET_ACTIVE_PAGE,
    L__SET_VIEW_MODE,
    L__SET_ACTIVE_SORT,
} from '../../action-types/siloDomainData';
import reducers from './leads.js';


test('should set leads filter without clearing old filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
            },
        },
    };

    const action = {
        type: L__SET_FILTER,
        filters: { source: 'tv' },
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari', source: 'tv' },
                activePage: 1,
            },
        },
    };

    expect(reducers[L__SET_FILTER](state, action)).toEqual(after);
});

test('should set leads filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };

    const action = {
        type: L__SET_FILTER,
        filters: { source: 'tv' },
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { source: 'tv' },
                activePage: 1,
            },
        },
    };

    expect(reducers[L__SET_FILTER](state, action)).toEqual(after);
});

test('should unset filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
            },
        },
    };

    const action = {
        type: L__SET_FILTER,
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: {},
                activePage: 1,
            },
        },
    };

    expect(reducers[L__UNSET_FILTER](state, action)).toEqual(after);
});

test('should set active page', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
            },
        },
    };

    const action = {
        type: L__SET_ACTIVE_PAGE,
        activePage: 2,
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_PAGE](state, action)).toEqual(after);
});

test('should set active page for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };

    const action = {
        type: L__SET_ACTIVE_PAGE,
        activePage: 2,
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                activePage: 2,
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_PAGE](state, action)).toEqual(after);
});

test('should set view mode', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
                viewMode: 'visualization',
            },
        },
    };

    const action = {
        type: L__SET_VIEW_MODE,
        viewMode: 'table',
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
                viewMode: 'table',
            },
        },
    };

    expect(reducers[L__SET_VIEW_MODE](state, action)).toEqual(after);
});

test('should set view mode for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };

    const action = {
        type: L__SET_VIEW_MODE,
        viewMode: 'visualization',
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                viewMode: 'visualization',
            },
        },
    };

    expect(reducers[L__SET_VIEW_MODE](state, action)).toEqual(after);
});

test('should set active sort', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
                activeSort: '-created-at',
            },
        },
    };

    const action = {
        type: L__SET_ACTIVE_SORT,
        activeSort: '+created-at',
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 1,
                activeSort: '+created-at',
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_SORT](state, action)).toEqual(after);
});

test('should set active sort for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };

    const action = {
        type: L__SET_ACTIVE_SORT,
        activeSort: '+created-at',
    };
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                activeSort: '+created-at',
                activePage: 1,
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_SORT](state, action)).toEqual(after);
});

test('should set leads', () => {
    const state = {
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
                activeSort: '-created-at',
                leads: [],
                totalLeadsCount: 0,
            },
        },
    };

    const action = {
        type: L__SET_LEADS,
        leads: ['lead1', 'lead2'],
        totalLeadsCount: 10,
        projectId: 2,
    };
    const after = {
        leadPage: {
            2: {
                filter: { search: 'hari' },
                activePage: 2,
                activeSort: '-created-at',
                leads: ['lead1', 'lead2'],
                totalLeadsCount: 10,
            },
        },
    };

    expect(reducers[L__SET_LEADS](state, action)).toEqual(after);
});

test('should set leads for first time', () => {
    const state = {
        leadPage: {
        },
    };

    const action = {
        type: L__SET_LEADS,
        leads: ['lead1', 'lead2'],
        totalLeadsCount: 10,
        projectId: 2,
    };
    const after = {
        leadPage: {
            2: {
                leads: ['lead1', 'lead2'],
                totalLeadsCount: 10,
            },
        },
    };

    expect(reducers[L__SET_LEADS](state, action)).toEqual(after);
});
