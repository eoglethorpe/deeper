import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_ANALYSIS_FRAMEWORK = 'domain-data/SET_ANALYSIS_FRAMEWORK';
export const SET_ANALYSIS_FRAMEWORKS = 'domain-data/SET_ANALYSIS_FRAMEWORKS';
export const ADD_NEW_AF = 'domain-data/ADD_NEW_AF';
export const SET_PROJECT_AF = 'domain-data/SET_PROJECT_AF';
export const SET_AF_DETAIL = 'domain-data/SET_AF_DETAIL';

// ACTION-CREATOR

export const setAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const setAnalysisFrameworksAction = ({ analysisFrameworks }) => ({
    type: SET_ANALYSIS_FRAMEWORKS,
    analysisFrameworks,
});

export const addNewAfAction = ({ afDetail, projectId }) => ({
    type: ADD_NEW_AF,
    afDetail,
    projectId,
});

export const setProjectAfAction = ({ projectId, afId }) => ({
    type: SET_PROJECT_AF,
    projectId,
    afId,
});

export const setAfDetailAction = ({ afId, afDetail }) => ({
    type: SET_AF_DETAIL,
    afId,
    afDetail,
});

// REDUCER

const setAnalysisFramework = (state, action) => {
    const { analysisFramework } = action;
    const settings = {
        analysisFrameworks: { $auto: {
            [analysisFramework.id]: { $auto: {
                $merge: analysisFramework,
            } },
        } },
    };
    return update(state, settings);
};

const setAnalysisFrameworks = (state, action) => {
    const { analysisFrameworks } = action;

    const keysOfState = Object.keys(state.analysisFrameworks);
    // Get keys to be removed
    // NOTE: Remove all keys except those to be merged
    const keysToRemove = keysOfState.filter(
        key => analysisFrameworks.findIndex(f => f.id === +key) < 0,
    );

    // Merge
    const analysisFrameworksSettings = analysisFrameworks.reduce(
        (acc, analysisFramework) => {
            acc[analysisFramework.id] = { $auto: {
                $merge: analysisFramework,
            } };
            return acc;
        },
        {},
    );

    // Remove
    const analysisFrameworksSettings2 = keysToRemove.reduce(
        (acc, key) => {
            acc[key] = { $set: undefined };
            return acc;
        },
        { ...analysisFrameworksSettings },
    );

    const settings = {
        analysisFrameworks: analysisFrameworksSettings2,
    };
    return update(state, settings);
};

const addNewAf = (state, action) => {
    const { afDetail, projectId } = action;
    const settings = {
        analysisFrameworks: { $auto: {
            [afDetail.id]: { $auto: {
                $merge: afDetail,
            } },
        } },
    };
    settings.projects = {
        [projectId]: { $auto: {
            analysisFramework: {
                $set: afDetail.id,
            },
        } },
    };
    return update(state, settings);
};

const setProjectAf = (state, action) => {
    const { projectId, afId } = action;
    const settings = {
        projects: { $auto: {
            [projectId]: { $auto: {
                analysisFramework: {
                    $set: afId,
                },
            } },
        } },
    };
    return update(state, settings);
};

const setAfDetail = (state, action) => {
    const { afId, afDetail } = action;
    const settings = {
        analysisFrameworks: {
            [afId]: { $auto: {
                $merge: afDetail,
            } },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_ANALYSIS_FRAMEWORK]: setAnalysisFramework,
    [SET_ANALYSIS_FRAMEWORKS]: setAnalysisFrameworks,
    [ADD_NEW_AF]: addNewAf,
    [SET_PROJECT_AF]: setProjectAf,
    [SET_AF_DETAIL]: setAfDetail,
};
export default reducers;
