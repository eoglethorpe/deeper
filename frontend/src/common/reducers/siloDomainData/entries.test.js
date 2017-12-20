import {
    E__SET_ENTRIES,
} from '../../action-types/siloDomainData';
import reducers from './entries.js';


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
    const action = {
        type: E__SET_ENTRIES,
        projectId: 2,
        entries: ['entry'],
        totalEntriesCount: 1,
    };
    expect(reducers[E__SET_ENTRIES](state, action)).toEqual(after);
});
