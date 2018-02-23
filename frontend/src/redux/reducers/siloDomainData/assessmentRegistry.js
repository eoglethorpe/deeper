import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const ARY__UPDATE_METADATA = 'silo-domain-data/ARY__UPDATE_METADATA';

// ACTION-CREATOR

export const updateAryMetadataAction = ({ metadata, aryId }) => ({
    type: ARY__UPDATE_METADATA,
    metadata,
    aryId,
});

// HELPERS

// REDUCER

const updateAryMetadata = (state, action) => {
    const { metadata, aryId } = action;

    const settings = {
        assessmentRegistryView: {
            [aryId]: { $auto: {
                metadata: { $auto: {
                    $merge: metadata,
                } },
            } },
        },
    };

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [ARY__UPDATE_METADATA]: updateAryMetadata,
};

export default reducers;
