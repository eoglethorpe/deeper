import {
    analyzeErrors,
} from '../../../vendor/react-store/components/Input/Faram/validator';
import update from '../../../vendor/react-store/utils/immutable-update';
import {
    SET_REGION_DETAILS,
    UNSET_REGION,
    ADD_NEW_REGION,
} from '../domainData/regions';

export const CHANGE_REGION_DETAILS = 'siloDomainData/CHANGE_REGION_DETAILS';
export const SET_REGION_DETAILS_ERRORS = 'siloDomainData/SET_REGION_DETAILS_ERRORS';

// TYPE

// ACTION-CREATOR

export const setRegionDetailsAction = ({ regionDetails, regionId, projectId }) => ({
    type: SET_REGION_DETAILS,
    regionId,
    regionDetails,
    projectId,
});

export const changeRegionDetailsAction = ({ faramValues, faramErrors, regionId }) => ({
    type: CHANGE_REGION_DETAILS,
    faramValues,
    faramErrors,
    regionId,
});

export const setRegionDetailsErrorsAction = ({ faramErrors, regionId }) => ({
    type: SET_REGION_DETAILS_ERRORS,
    faramErrors,
    regionId,
});

// REDUCER
const setRegionDetails = (state, action) => {
    const { regionId, regionDetails } = action;
    const settings = {
        regions: { $auto: {
            [regionId]: { $auto: {
                $set: regionDetails,
            } },
        } },
    };
    return update(state, settings);
};

const changeRegionDetails = (state, action) => {
    const {
        faramValues,
        faramErrors,
        regionId,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        regions: { $auto: {
            [regionId]: { $auto: {
                faramValues: { $set: faramValues },
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
                pristine: { $set: true },
            } },
        } },
    };
    return update(state, settings);
};

const setRegionDetailsErrors = (state, action) => {
    const {
        faramErrors,
        regionId,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        regions: { $auto: {
            [regionId]: { $auto: {
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
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
                faramValues: { $auto: {
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
    [CHANGE_REGION_DETAILS]: changeRegionDetails,
    [SET_REGION_DETAILS_ERRORS]: setRegionDetailsErrors,
    [UNSET_REGION]: unsetRegion,
    [ADD_NEW_REGION]: addNewRegion,
};

export default reducers;
