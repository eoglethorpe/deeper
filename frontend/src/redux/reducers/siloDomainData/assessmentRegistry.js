import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const ARY__UPDATE = 'silo-domain-data/ARY__UPDATE';

// ACTION-CREATOR

export const setAryAction = ({ id, metaData, methodologyData }) => ({
    type: ARY__UPDATE,
    id,
    metaData,
    methodologyData,
});

// HELPERS

// REDUCER

const setAry = (state, action) => {
    const {
        id,
        metaData = {},
        methodologyData = {},
    } = action;
    const settings = {
        aryView: {
            [id]: { $auto: {
                metaData: { $auto: {
                    $merge: metaData,
                } },
                methodologyData: { $auto: {
                    $merge: methodologyData,
                } },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [ARY__UPDATE]: setAry,
};

export default reducers;
