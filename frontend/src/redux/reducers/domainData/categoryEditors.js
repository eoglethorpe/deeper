import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_CATEGORY_EDITORS = 'domain-data/SET_CATEGORY_EDITORS';
export const ADD_NEW_CE = 'domain-data/ADD_NEW_CE';
export const SET_PROJECT_CE = 'domain-data/SET_PROJECT_CE';
export const SET_CE_DETAIL = 'domain-data/SET_CE_DETAIL';

// ACTION-CREATOR

export const setCategoryEditorsAction = ({ categoryEditors }) => ({
    type: SET_CATEGORY_EDITORS,
    categoryEditors,
});

export const addNewCeAction = ({ ceDetail, projectId }) => ({
    type: ADD_NEW_CE,
    ceDetail,
    projectId,
});

export const setProjectCeAction = ({ projectId, ceId }) => ({
    type: SET_PROJECT_CE,
    projectId,
    ceId,
});

export const setCeDetailAction = ({ ceId, ceDetail }) => ({
    type: SET_CE_DETAIL,
    ceId,
    ceDetail,
});

// REDUCER

const setCategoryEditors = (state, action) => {
    const { categoryEditors } = action;

    const keysOfState = Object.keys(state.categoryEditors);
    // Get keys to be removed
    // NOTE: Remove all keys except those to be merged
    const keysToRemove = keysOfState.filter(
        key => categoryEditors.findIndex(f => f.id === +key) < 0,
    );

    // Merge
    const categoryEditorsSettings = categoryEditors.reduce(
        (acc, categoryEditor) => {
            acc[categoryEditor.id] = { $auto: {
                $merge: categoryEditor,
            } };
            return acc;
        },
        {},
    );

    // Remove
    const categoryEditorsSettings2 = keysToRemove.reduce(
        (acc, key) => {
            acc[key] = { $set: undefined };
            return acc;
        },
        { ...categoryEditorsSettings },
    );

    const settings = {
        categoryEditors: categoryEditorsSettings2,
    };
    return update(state, settings);
};

const addNewCe = (state, action) => {
    const { ceDetail, projectId } = action;
    const settings = {
        categoryEditors: { $auto: {
            [ceDetail.id]: { $auto: {
                $merge: ceDetail,
            } },
        } },
    };
    settings.projects = {
        [projectId]: { $auto: {
            categoryEditor: {
                $set: ceDetail.id,
            },
        } },
    };
    return update(state, settings);
};

const setProjectCe = (state, action) => {
    const { projectId, ceId } = action;
    const settings = {
        projects: { $auto: {
            [projectId]: { $auto: {
                categoryEditor: {
                    $set: ceId,
                },
            } },
        } },
    };
    return update(state, settings);
};

const setCeDetail = (state, action) => {
    const { ceId, ceDetail } = action;
    const settings = {
        categoryEditors: {
            [ceId]: { $auto: {
                $merge: ceDetail,
            } },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_CATEGORY_EDITORS]: setCategoryEditors,
    [ADD_NEW_CE]: addNewCe,
    [SET_PROJECT_CE]: setProjectCe,
    [SET_CE_DETAIL]: setCeDetail,
};

export default reducers;
