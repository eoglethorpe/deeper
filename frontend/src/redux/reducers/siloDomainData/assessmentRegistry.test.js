import reducers, {
    ARY__UPDATE,
    setAryAction,
} from './assessmentRegistry';


test('should update Assessment Registry metadata', () => {
    const state = {
        aryView: { },
    };

    const action = setAryAction({
        metadata: {},
        methodology: {},
        lead: 1,
    });

    const after = {
        aryView: {
            1: {
                metadata: {},
                methodology: {},
            },
        },
    };

    expect(reducers[ARY__UPDATE](state, action)).toEqual(after);
});
