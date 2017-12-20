import reducers, {
    E__SET_ENTRIES,
    setEntriesAction,
} from './entries.js';


test('should set entries', () => {
    const state = { entriesView: {} };
    const after = {
        entriesView: {
            2: {
                entries: ['entry'],
                totalEntriesCount: 1,
            },
        },
    };
    const action = setEntriesAction({
        projectId: 2,
        entries: ['entry'],
        totalEntriesCount: 1,
    });
    expect(reducers[E__SET_ENTRIES](state, action)).toEqual(after);
});
