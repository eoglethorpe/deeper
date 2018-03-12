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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadPrevAction();
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { data: { id: 1 } },
                { data: { id: 2 } },
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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadPrevAction();
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { data: { id: 1 } },
                { data: { id: 2 } },
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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadNextAction();
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { data: { id: 1 } },
                { data: { id: 2 } },
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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadNextAction();
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { data: { id: 1 } },
                { data: { id: 2 } },
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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadRemoveAction(1);
    const after = {
        addLeadView: {
            activeLeadId: 2,
            leads: [
                { data: { id: 2 } },
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
                { data: { id: 1 } },
                { data: { id: 2 } },
            ],
        },
    };
    const action = addLeadViewLeadRemoveAction(2);
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                { data: { id: 1 } },
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
                { data: { id: 2, serverId: 2 } },
                { data: { id: 4 } },
                { data: { id: 1, serverId: 1 } },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 4 },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false },
                },
            ],
        },
    };
    const action = addLeadViewLeadChangeAction({
        leadId: 1,
        values: { title: 'Lead #1' },
        formFieldErrors: { title: 'Very short' },
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    data: {
                        id: 1,
                        serverId: 1,
                    },
                    form: {
                        errors: undefined,
                        fieldErrors: { title: 'Very short' },
                        values: { title: 'Lead #1' },
                    },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: true },
                },
            ],
        },
    };
    const action = addLeadViewLeadChangeAction({
        leadId: 1,
        values: { title: 'Lead #1' },
        formFieldErrors: {},
        formErrors: { errors: ['Network problem'] },
        uistate: { pristine: false },
    });
    const after = {
        addLeadView: {
            activeLeadId: 1,
            leads: [
                {
                    data: {
                        id: 1,
                        serverId: 1,
                    },
                    form: {
                        errors: { errors: ['Network problem'] },
                        fieldErrors: {},
                        values: { title: 'Lead #1' },
                    },
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
                    data: { id: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
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
                    data: {
                        id: 1,
                        serverId: 12,
                    },
                    form: {
                        errors: {},
                        fieldErrors: {},
                        values: {},
                    },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: true },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: true },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: {} },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: true, serverError: false },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: true },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'md' } },
                    uiState: { error: false, pristine: true },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: true, serverError: false },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: { title: 'ld' } },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: { project: 1 } },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: { assignee: 'error' }, values: { assignee: 'ld', project: 1 } },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { project: 2 } },
                    uiState: { error: false, pristine: false },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: {} },
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
                    data: { id: 1, serverId: 1 },
                    form: { errors: {}, fieldErrors: {}, values: { assignee: 'ld', project: 1 } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 2, serverId: 2 },
                    form: { errors: {}, fieldErrors: { assignee: 'error' }, values: { assignee: 'ld', project: 1 } },
                    uiState: { error: true, pristine: false, serverError: false },
                },
                {
                    data: { id: 3, serverId: 3 },
                    form: { errors: {}, fieldErrors: {}, values: { project: 2 } },
                    uiState: { error: false, pristine: false, serverError: false },
                },
                {
                    data: { id: 5, serverId: undefined },
                    form: { errors: {}, fieldErrors: {}, values: {} },
                    uiState: { error: false, pristine: false, serverError: false },
                },
            ],
        },
    };
    expect(reducers[LA__COPY_ALL](state, action)).toEqual(after);
});
