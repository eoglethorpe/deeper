import { DIFF_ACTION } from '../../../entities/entry';
import reducers, {
    EE__ADD_ENTRY,
    EE__REMOVE_ENTRY,
    EE__SET_ACTIVE_ENTRY,
    EE__SET_LEAD,
    EE__ENTRY_SAVE,
    EE__ENTRY_CHANGE,
    EE__ENTRY_DIFF,
    EE__ENTRY_MARK_FOR_DELETE,
    setEditEntryLeadAction,
    addEntryAction,
    removeEntryAction,
    saveEntryAction,
    changeEntryAction,
    diffEntriesAction,
    markForDeleteEntryAction,
    setActiveEntryAction,
} from './editEntries.js';

test('should set lead', () => {
    const state = {
        editEntry: {},
    };
    const action = setEditEntryLeadAction({
        lead: { id: 1, title: 'Lead #1' },
    });
    const after = {
        editEntry: {
            1: {
                lead: { id: 1, title: 'Lead #1' },
            },
        },
    };
    expect(reducers[EE__SET_LEAD](state, action)).toEqual(after);
});

test('should add entry', () => {
    const state = {
        editEntry: {},
    };

    const action = addEntryAction({
        entry: {
            id: 'flksjal',
            serverId: 2,
            values: { title: 'Entry #1' },
        },
        leadId: 1,
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                            order: 1,
                            excerpt: '',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ADD_ENTRY](state, action)).toEqual(after);
});

test('should add entry', () => {
    const state = {
        editEntry: {},
    };
    const action = addEntryAction({
        entry: {
            id: 'flksjal',
            serverId: 2,
            values: { title: 'Entry #1' },
        },
        leadId: 1,
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                            order: 1,
                            excerpt: '',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ADD_ENTRY](state, action)).toEqual(after);
});

test('should save entry', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    const action = saveEntryAction({
        leadId: 1,
        entryId: 'flksjal',
        data: {
            versionId: 1,
        },
        values: {
            some: 'attribute',
        },
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                            versionId: 1,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                            some: 'attribute',
                        } },
                        uiState: {
                            error: false,
                            pristine: true,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ENTRY_SAVE](state, action)).toEqual(after);
});

test('should change entry', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: {
                            values: {
                                title: 'Entry #1',
                            },
                            colors: {
                                id1: '#fff',
                            },
                        },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    const action = changeEntryAction({
        leadId: 1,
        entryId: 'flksjal',
        data: {
            versionId: 1,
        },
        values: {
            some: 'attribute',
        },
        colors: {
            id1: '#f00',
            id2: '#0f0',
        },
        uiState: { error: true },
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                            versionId: 1,
                        },
                        widget: {
                            values: {
                                title: 'Entry #1',
                                some: 'attribute',
                            },
                            colors: {
                                id1: '#f00',
                                id2: '#0f0',
                            },
                        },
                        uiState: {
                            error: true,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ENTRY_CHANGE](state, action)).toEqual(after);
});

test('should mark for delete', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    const action = markForDeleteEntryAction({
        leadId: 1,
        entryId: 'flksjal',
        mark: true,
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: undefined,
                entries: [
                    {
                        markedForDelete: true,
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ENTRY_MARK_FOR_DELETE](state, action)).toEqual(after);
});

test('should delete entry at bottom', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                        },
                    },
                    {
                        data: {
                            id: 'gksgk',
                        },
                    },
                ],
            },
        },
    };
    const action = removeEntryAction({
        leadId: 1,
        entryId: 'flksjal',
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'gksgk',
                entries: [
                    {
                        data: {
                            id: 'gksgk',
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__REMOVE_ENTRY](state, action)).toEqual(after);
});

test('should delete entry at top', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'gksgk',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                        },
                    },
                    {
                        data: {
                            id: 'gksgk',
                        },
                    },
                ],
            },
        },
    };
    const action = removeEntryAction({
        leadId: 1,
        entryId: 'gksgk',
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__REMOVE_ENTRY](state, action)).toEqual(after);
});

test('should set active entry', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'flksjal',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                        },
                    },
                    {
                        data: {
                            id: 'gksgk',
                        },
                    },
                ],
            },
        },
    };
    const action = setActiveEntryAction({
        leadId: 1,
        entryId: 'gksgk',
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'gksgk',
                entries: [
                    {
                        data: {
                            id: 'flksjal',
                        },
                    },
                    {
                        data: {
                            id: 'gksgk',
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__SET_ACTIVE_ENTRY](state, action)).toEqual(after);
});

test('should apply diff', () => {
    const state = {
        editEntry: {
            1: {
                selectedEntryId: 'klklk',
                entries: [
                    // replace skip
                    {
                        data: {
                            id: 'ababa',
                            serverId: 1,
                            versionId: 1,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // replace
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                            versionId: 1,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // noop
                    {
                        data: {
                            id: 'gksgk',
                        },
                        widget: { values: {
                            title: 'Entry #2',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // delete
                    {
                        data: {
                            id: 'klklk',
                            serverId: 4,
                        },
                        widget: { values: {
                            title: 'Entry #4',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // deleted skip
                    {
                        data: {
                            id: 'ppppp',
                            serverId: 5,
                        },
                        widget: { values: {
                            title: 'Entry #5',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    const action = diffEntriesAction({
        leadId: 1,
        diffs: [
            // added
            {
                action: DIFF_ACTION.add,
                skip: false,
                entry: {
                    data: {
                        id: 'zzzzz',
                        serverId: 100,
                    },
                    widget: { values: {
                        title: 'Entry #100',
                    } },
                    uiState: {
                        error: false,
                        pristine: false,
                    },
                },
            },
            // added skip
            {
                action: DIFF_ACTION.add,
                skip: true,
            },
            // replace skip
            {
                action: DIFF_ACTION.replace,
                skip: true,
                entryOnSkip: {
                    data: {
                        id: 'ababa',
                        serverId: 1,
                        versionId: 2,
                    },
                    widget: { values: {
                        title: 'Entry #1',
                    } },
                    uiState: {
                        error: false,
                        pristine: false,
                    },
                },
            },
            // replace
            {
                action: DIFF_ACTION.replace,
                skip: false,
                entry: {
                    data: {
                        id: 'flksjal',
                        serverId: 2,
                        versionId: 2,
                    },
                    widget: { values: {
                        title: 'Entry #1 (changed)',
                    } },
                    uiState: {
                        error: false,
                        pristine: false,
                    },
                },
            },
            // noop
            {
                action: DIFF_ACTION.noop,
                id: 'gksgk',
            },
            // remove
            {
                action: DIFF_ACTION.remove,
                id: 'klklk',
            },
            // remove skip
            {
                action: DIFF_ACTION.remove,
                skip: true,
                id: 'ppppp',
            },
        ],
    });
    const after = {
        editEntry: {
            1: {
                selectedEntryId: 'zzzzz',
                entries: [
                    // newly added
                    {
                        data: {
                            id: 'zzzzz',
                            serverId: 100,
                        },
                        widget: { values: {
                            title: 'Entry #100',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // changed in server skipped
                    {
                        data: {
                            id: 'ababa',
                            serverId: 1,
                            versionId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // changed in server
                    {
                        data: {
                            id: 'flksjal',
                            serverId: 2,
                            versionId: 2,
                        },
                        widget: { values: {
                            title: 'Entry #1 (changed)',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    // noop
                    {
                        data: {
                            id: 'gksgk',
                        },
                        widget: { values: {
                            title: 'Entry #2',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                    {
                        data: {
                            id: 'ppppp',
                            serverId: 5,
                        },
                        widget: { values: {
                            title: 'Entry #5',
                        } },
                        uiState: {
                            error: false,
                            pristine: false,
                        },
                    },
                ],
            },
        },
    };
    expect(reducers[EE__ENTRY_DIFF](state, action)).toEqual(after);
});
