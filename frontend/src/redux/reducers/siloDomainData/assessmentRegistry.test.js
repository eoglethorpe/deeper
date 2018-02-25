import reducers, {
    ARY__UPDATE_METADATA,
    updateAryMetadataAction,
} from './assessmentRegistry';


test('should update Assessment Registry metadata', () => {
    const state = {
        assessmentRegistryView: { },
    };

    const action = updateAryMetadataAction({
        metadata: {},
        aryId: 1,
    });

    const after = {
        assessmentRegistryView: {
            1: {
                metadata: {},
            },
        },
    };

    expect(reducers[ARY__UPDATE_METADATA](state, action)).toEqual(after);
});
