import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_REGION_DETAILS = 'domainData/SET_REGION_DETAILS';
export const UNSET_REGION = 'domainData/UNSET_REGION';
export const ADD_NEW_REGION = 'domainData/ADD_NEW_REGION';
export const REMOVE_PROJECT_REGION = 'domainData/REMOVE_PROJECT_REGION';
export const SET_REGIONS = 'domainData/SET_REGIONS';
export const SET_GEO_OPTIONS = 'domainData/SET_GEO_OPTIONS';
export const SET_REGIONS_FOR_PROJECT = 'domainData/SET_REGIONS_FOR_PROJECT';
export const SET_ADMIN_LEVELS_FOR_REGION = 'domainData/SET_ADMIN_LEVELS_FOR_REGION';
export const ADD_ADMIN_LEVEL_FOR_REGION = 'domainData/ADD_ADMIN_LEVEL_FOR_REGION';
export const UNSET_ADMIN_LEVEL_FOR_REGION = 'domainData/UNSET_ADMIN_LEVEL_FOR_REGION';

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

export const setGeoOptionsAction = ({ projectId, locations }) => ({
    type: SET_GEO_OPTIONS,
    projectId,
    locations,
});

export const setRegionsForProjectAction = ({ projectId, regions }) => ({
    type: SET_REGIONS_FOR_PROJECT,
    projectId,
    regions,
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

    const regionsObject = regions.reduce(
        (acc, region) => {
            acc[region.id] = region;
            return acc;
        },
        {},
    );

    const settings = {
        regions: {
            $set: regionsObject,
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

const setGeoOptions = (state, action) => {
    const { projectId, locations } = action;
    const settings = {
        geoOptions: { $auto: {
            [projectId]: { $autoArray: {
                $set: locations,
            } },
        } },
    };
    return update(state, settings);
};

const setRegionsForProject = (state, action) => {
    const { projectId, regions } = action;
    const settings = {
        regionsForProject: { $auto: {
            [projectId]: { $autoArray: {
                $set: regions,
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

const setRegionDetails = (state, action) => {
    const { regionId, regionDetails, projectId } = action;
    const regionDetailValues = regionDetails.formValues || {};
    const settings = {
        regions: {
            [regionId]: { $auto: {
                $merge: {
                    code: regionDetailValues.code,
                    title: regionDetailValues.title,
                },
            } },
        },
    };
    if (projectId) {
        const index = ((state.projects[projectId] || {}).regions
            || []).findIndex(d => (d.id === regionId));
        if (index !== -1) {
            settings.projects = {
                [projectId]: { $auto: {
                    regions: { $autoArray: {
                        [index]: { $merge: {
                            title: regionDetailValues.title,
                        } },
                    } },
                } },
            };
        }
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
    [SET_GEO_OPTIONS]: setGeoOptions,
    [SET_REGIONS_FOR_PROJECT]: setRegionsForProject,
    [UNSET_REGION]: unsetRegion,
    [REMOVE_PROJECT_REGION]: removeProjectRegion,
    [ADD_NEW_REGION]: addNewRegion,
    [SET_ADMIN_LEVELS_FOR_REGION]: setAdminLevelsForRegion,
    [ADD_ADMIN_LEVEL_FOR_REGION]: addAdminLevelForRegion,
    [UNSET_ADMIN_LEVEL_FOR_REGION]: removeAdminLevelForRegion,
    [SET_REGION_DETAILS]: setRegionDetails,
};
export default reducers;
