import update from '../../../public/utils/immutable-update';

// TYPE

export const UNSET_REGION = 'domain-data/UNSET_REGION';
export const ADD_NEW_REGION = 'domain-data/ADD_NEW_REGION';
export const REMOVE_PROJECT_REGION = 'domain-data/REMOVE_PROJECT_REGION';
export const SET_REGIONS = 'domain-data/SET_REGIONS';
export const SET_REGION_DETAILS = 'domain-data/SET_REGION_DETAILS';
export const SET_ADMIN_LEVELS_FOR_REGION = 'domain-data/SET_ADMIN_LEVELS_FOR_REGION';
export const ADD_ADMIN_LEVEL_FOR_REGION = 'domain-data/ADD_ADMIN_LEVEL_FOR_REGION';
export const UNSET_ADMIN_LEVEL_FOR_REGION = 'domain-data/UNSET_ADMIN_LEVEL_FOR_REGION';

// ACTION-CREATOR

export const unSetRegionAction = ({ regionId }) => ({
    type: UNSET_REGION,
    regionId,
});

export const setAdminLevelsForRegionAction = ({ adminLevels, regionId }) => ({
    type: SET_ADMIN_LEVELS_FOR_REGION,
    adminLevels,
    regionId,
});

export const addAdminLevelForRegionAction = ({ adminLevel, regionId }) => ({
    type: ADD_ADMIN_LEVEL_FOR_REGION,
    adminLevel,
    regionId,
});

export const unsetAdminLevelForRegionAction = ({ adminLevelId, regionId }) => ({
    type: UNSET_ADMIN_LEVEL_FOR_REGION,
    adminLevelId,
    regionId,
});

export const setRegionDetailsAction = ({ regionDetails, regionId }) => ({
    type: SET_REGION_DETAILS,
    regionId,
    regionDetails,
});

export const setRegionsAction = ({ regions }) => ({
    type: SET_REGIONS,
    regions,
});

export const addNewRegionAction = ({ regionDetail, projectId }) => ({
    type: ADD_NEW_REGION,
    regionDetail,
    projectId,
});

export const removeProjectRegionAction = ({ projectId, regionId }) => ({
    type: REMOVE_PROJECT_REGION,
    projectId,
    regionId,
});


// REDUCER

const setRegions = (state, action) => {
    const { regions } = action;

    const regionSettings = regions.reduce(
        (acc, region) => {
            acc[region.id] = { $auto: {
                $set: region,
            } };
            return acc;
        },
        {},
    );

    const settings = {
        regions: regionSettings,
    };
    return update(state, settings);
};

const setRegionDetails = (state, action) => {
    const { regionId, regionDetails } = action;
    const settings = {
        regions: {
            [regionId]: { $auto: {
                $merge: regionDetails,
            } },
        },
    };
    return update(state, settings);
};

const unsetRegion = (state, action) => {
    const { regionId } = action;
    const settings = {
        regions: {
            [regionId]: { $auto: {
                $set: undefined,
            } },
        },
    };
    return update(state, settings);
};

const removeProjectRegion = (state, action) => {
    const { projectId, regionId } = action;

    const settings = {};
    const index = ((state.projects[projectId] || {}).regions
        || []).findIndex(d => (d.id === regionId));

    if (index !== -1) {
        settings.projects = {
            [projectId]: { $auto: {
                regions: { $autoArray: {
                    $splice: [[index, 1]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const addNewRegion = (state, action) => {
    const { regionDetail, projectId } = action;
    const settings = {
        regions: { $auto: {
            [regionDetail.id]: { $auto: {
                $merge: regionDetail,
            } },
        } },
    };
    if (projectId) {
        const index = ((state.projects[projectId] || {}).regions
            || []).findIndex(d => (d.id === regionDetail.id));
        if (index === -1) {
            settings.projects = {
                [projectId]: { $auto: {
                    regions: { $autoArray: {
                        $push: [{
                            id: regionDetail.id,
                            title: regionDetail.title,
                        }],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setAdminLevelsForRegion = (state, action) => {
    const { adminLevels, regionId } = action;
    const settings = {
        adminLevels: { $auto: {
            [regionId]: { $autoArray: {
                $set: adminLevels,
            } },
        } },
    };
    return update(state, settings);
};

const addAdminLevelForRegion = (state, action) => {
    const { adminLevel, regionId } = action;
    const index = (state.adminLevels[regionId]
        || []).findIndex(d => (d.id === adminLevel.id));

    let settings = {};
    if (index === -1) {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $push: [adminLevel],
                } },
            } },
        };
    } else {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $splice: [[index, 1, adminLevel]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const removeAdminLevelForRegion = (state, action) => {
    const { adminLevelId, regionId } = action;
    const index = (state.adminLevels[regionId]
        || []).findIndex(d => (d.id === adminLevelId));

    let settings = {};
    if (index !== -1) {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $splice: [[index, 1]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const reducers = {
    [SET_REGIONS]: setRegions,
    [SET_REGION_DETAILS]: setRegionDetails,
    [UNSET_REGION]: unsetRegion,
    [REMOVE_PROJECT_REGION]: removeProjectRegion,
    [ADD_NEW_REGION]: addNewRegion,
    [SET_ADMIN_LEVELS_FOR_REGION]: setAdminLevelsForRegion,
    [ADD_ADMIN_LEVEL_FOR_REGION]: addAdminLevelForRegion,
    [UNSET_ADMIN_LEVEL_FOR_REGION]: removeAdminLevelForRegion,
};
export default reducers;
