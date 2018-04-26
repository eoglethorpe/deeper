import reducers, {
    LA__SET_FILTERS,
    LA__UNSET_FILTERS,
    LA__SET_ACTIVE_LEAD_ID,
    LA__LEAD_NEXT,
    LA__LEAD_PREV,
    LA__ADD_LEADS,
    LA__LEAD_CHANGE,
    LA__LEAD_SAVE,
    LA__LEAD_REMOVE,
    LA__COPY_ALL,
    LA__COPY_ALL_BELOW,
    addLeadViewSetFiltersAction,
    addLeadViewUnsetFiltersAction,
    addLeadViewSetActiveLeadIdAction,
    addLeadViewAddLeadsAction,
    addLeadViewLeadChangeAction,
    addLeadViewLeadSaveAction,
    addLeadViewLeadRemoveAction,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewCopyAllBelowAction,
    addLeadViewCopyAllAction,
} from './addLeads';

test('should set filters', () => {
    const state = {
        addLeadView: {
        },
    };

    const action = addLeadViewSetFiltersAction({ search: 'hari' });
    const after = {
        addLeadView: {
            filters: { search: 'hari' },
        },
    };
    expect(reducers[LA__SET_FILTERS](state, action)).toEqual(after);
});

test('should reset filters', () => {
    const state = {
        addLeadView: {
            filters: { search: 'hari' },
        },
    };
    const action = addLeadViewUnsetFiltersAction();
    const after = {
        addLeadView: {
            filters: { },
        },
    };
    expect(reducers[LA__UNSET_FILTERS](state, action)).toEqual(after);
});

test('should set active lead', () => {
    const state = {
        addLeadView: {
        },
    };
    const action = addLeadViewSetActiveLeadIdAction(2);
    const after = {
        addLeadView: {
            activeLeadId: 2,
        },
    };
    expect(reducers[LA__SET_ACTIVE_LEAD_ID](state, action)).toEqual(after);
});

test('should set previous lead as active', () => {
    const state = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadPrevAction();
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    expect(reducers[LA__LEAD_PREV](state, action)).toEqual(after);
});

test('should set previous lead as active, when no previous lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadPrevAction();
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    expect(reducers[LA__LEAD_PREV](state, action)).toEqual(after);
});


test('should set next lead as active', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadNextAction();
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    expect(reducers[LA__LEAD_NEXT](state, action)).toEqual(after);
});

test('should set next lead as active, when no next lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadNextAction();
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    expect(reducers[LA__LEAD_NEXT](state, action)).toEqual(after);
});

test('should remove lead from top', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadRemoveAction(1);
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 2 },
            ],
        },
    };
    expect(reducers[LA__LEAD_REMOVE](state, action)).toEqual(after);
});

test('should remove lead from bottom', () => {
    const state = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { id: 1 },
                { id: 2 },
            ],
        },
    };
    const action = addLeadViewLeadRemoveAction(2);
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 1 },
            ],
        },
    };
    expect(reducers[LA__LEAD_REMOVE](state, action)).toEqual(after);
});

test('should add new leads', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { id: 2, serverId: 2 },
                { id: 4 },
                { id: 1, serverId: 1 },
            ],
        },
    };
    const action = addLeadViewAddLeadsAction([
        { id: 1, serverId: 1 },
        { id: 2, serverId: 2 },
        { id: 3, serverId: 3 },
        { id: 5 },
    ]);
    const after = {
        addLeadView: {
            activeLeadId: 1,
            filters: {
                search: '',
                source: '',
                status: '',
                type: [],
            },
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 4,
                },
            ],
        },
    };
    expect(reducers[LA__ADD_LEADS](state, action)).toEqual(after);
});

test('should change lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false },
                },
            ],
        },
    };
    const action = addLeadViewLeadChangeAction({
        leadId: 1,
        faramValues: { title: 'Lead #1' },
        faramErrors: { title: 'Very short' },
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: { title: 'Very short' },
                    faramValues: { title: 'Lead #1' },
                    uiState: {
                        error: true,
                        serverError: false,
                        pristine: false,
                    },
                },
            ],
        },
    };
    expect(reducers[LA__LEAD_CHANGE](state, action)).toEqual(after);
});

test('should change lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramValues: {},
                    faramErrors: {},
                    uiState: { error: false, pristine: true },
                },
            ],
        },
    };
    const action = addLeadViewLeadChangeAction({
        leadId: 1,
        faramValues: { title: 'Lead #1' },
        faramErrors: { $internal: ['Network problem'] },
        uistate: { pristine: false },
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: { $internal: ['Network problem'] },
                    faramValues: { title: 'Lead #1' },
                    uiState: {
                        error: true,
                        pristine: true,
                        serverError: false,
                    },
                },
            ],
        },
    };
    expect(reducers[LA__LEAD_CHANGE](state, action)).toEqual(after);
});

test('should save lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false },
                },
            ],
        },
    };
    const action = addLeadViewLeadSaveAction({
        leadId: 1,
        serverId: 12,
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 12,
                    faramErrors: {},
                    faramValues: {},
                    uiState: {
                        error: false,
                        pristine: true,
                    },
                },
            ],
        },
    };
    expect(reducers[LA__LEAD_SAVE](state, action)).toEqual(after);
});

test('should copy values in all lead', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: true },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: true },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: true },
                },
            ],
        },
    };
    const action = addLeadViewCopyAllAction({
        leadId: 2,
        attrName: 'title',
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: true, serverError: false },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false, serverError: false },
                },
            ],
        },
    };
    expect(reducers[LA__COPY_ALL](state, action)).toEqual(after);
});

test('should copy values in leads below', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: true },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { title: 'md' },
                    uiState: { error: false, pristine: true },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: true },
                },
            ],
        },
    };
    const action = addLeadViewCopyAllBelowAction({
        leadId: 2,
        attrName: 'title',
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: true, serverError: false },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: { title: 'ld' },
                    uiState: { error: false, pristine: true, serverError: false },
                },
            ],
        },
    };
    expect(reducers[LA__COPY_ALL_BELOW](state, action)).toEqual(after);
});

test('should copy values in all lead, for assignee', () => {
    const state = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: { project: 1 },
                    uiState: { error: false, pristine: false },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { assignee: 'ld', project: 1 },
                    uiState: { error: false, pristine: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { project: 2 },
                    uiState: { error: false, pristine: false },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false },
                },
            ],
        },
    };
    const action = addLeadViewCopyAllAction({
        leadId: 2,
        attrName: 'assignee',
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    id: 1,
                    serverId: 1,
                    faramErrors: {},
                    faramValues: { assignee: 'ld', project: 1 },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 2,
                    serverId: 2,
                    faramErrors: {},
                    faramValues: { assignee: 'ld', project: 1 },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 3,
                    serverId: 3,
                    faramErrors: {},
                    faramValues: { project: 2 },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    id: 5,
                    serverId: undefined,
                    faramErrors: {},
                    faramValues: {},
                    uiState: { error: false, pristine: false, serverError: false },
                },
            ],
        },
    };
    expect(reducers[LA__COPY_ALL](state, action)).toEqual(after);
});
