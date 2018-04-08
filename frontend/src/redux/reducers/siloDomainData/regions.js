import update from '../../../vendor/react-store/utils/immutable-update';
import {
    SET_REGION_DETAILS,
    UNSET_REGION,
    ADD_NEW_REGION,
} from '../domainData/regions';

// TYPE

// ACTION-CREATOR

export const setRegionDetailsAction = ({ regionDetails, regionId, projectId }) => ({
    type: SET_REGION_DETAILS,
    regionId,
    regionDetails,
    projectId,
});

// REDUCER
const setRegionDetails = (state, action) => {
    const { regionId, regionDetails } = action;
    const settings = {
        regions: { $auto: {
            [regionId]: { $auto: {
                $merge: regionDetails,
            } },
        } },
    };
    return update(state, settings);
};

const addNewRegion = (state, action) => {
    const { regionDetail } = action;
    const settings = {
        regions: { $auto: {
            [regionDetail.id]: { $auto: {
                id: { $set: regionDetail.id },
                versionId: { $set: regionDetail.versionId },
                public: { $set: regionDetail.public },
                formValues: { $auto: {
                    $merge: regionDetail,
                } },
            } },
        } },
    };
    return update(state, settings);
};

const unsetRegion = (state, action) => {
    const { regionId } = action;
    const settings = {
        regions: { $auto: {
            [regionId]: { $auto: {
                $set: undefined,
            } },
        } },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [SET_REGION_DETAILS]: setRegionDetails,
    [UNSET_REGION]: unsetRegion,
    [ADD_NEW_REGION]: addNewRegion,
};

export default reducers;
