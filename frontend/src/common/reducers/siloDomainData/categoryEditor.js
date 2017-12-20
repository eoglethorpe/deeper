import update from '../../../public/utils/immutable-update';
import {
    CE__ADD_NEW_CATEGORY,
    CE__SET_ACTIVE_CATEGORY_ID,
    CE__ADD_NEW_SUBCATEGORY,
    CE__UPDATE_SELECTED_SUBCATEGORIES,
    CE__UPDATE_SELECTED_SUBCATEGORY,
} from '../../action-types/siloDomainData';

// HELPERS

const getIndicesFromSelectedCategories = (categories, activeCategoryId, stopLevel) => {
    const activeCategoryIndex = categories.findIndex(d => d.id === activeCategoryId);

    const {
        selectedSubcategories,
        subcategories: firstSubcategories,
    } = categories[activeCategoryIndex];

    const { indices: newIndices } = selectedSubcategories.reduce(
        ({ subcategories, indices }, selected) => {
            const index = subcategories.findIndex(d => d.id === selected);
            return {
                subcategories: subcategories[index].subcategories,
                indices: indices.concat([index]),
            };
        },
        { subcategories: firstSubcategories, indices: [activeCategoryIndex] },
    );

    if (stopLevel >= 0) {
        newIndices.splice(stopLevel + 1);
    }

    return newIndices;
};

const newSubcategoryWrapper = (val, i) => (i <= 0 ? val : ({ subcategories: val }));

const buildSettings = (indices, action, value, wrapper) => (
    // NOTE: reverse() mutates the array so making a copy
    [...indices].reverse().reduce(
        (acc, selected, index) => wrapper(
            { [selected]: acc },
            indices.length - index - 1,
        ),
        wrapper({ [action]: value }, indices.length),
    )
);

const getCategoryIdFromCategory = category => category.id;

// REDUCER

const ceAddNewCategory = (state, action) => {
    const { id, title } = action;
    const newCategory = {
        id,
        title,
        selectedSubcategories: [],
        subcategories: [],
    };

    const settings = {
        categoryEditorView: {
            activeCategoryId: { $set: id },
            categories: { $push: [newCategory] },
        },
    };
    return update(state, settings);
};

const ceSetActiveCategoryId = (state, action) => {
    const { id } = action;
    const settings = {
        categoryEditorView: {
            activeCategoryId: { $set: id },
        },
    };
    return update(state, settings);
};

const ceAddNewSubcategory = (state, action) => {
    const { newSubcategory, level } = action;
    const { categoryEditorView } = state;
    const { categories, activeCategoryId } = categoryEditorView;

    const settingAction = '$push';
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
        level,
    );

    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        [newSubcategory],
        newSubcategoryWrapper,
    );
    const settings = {
        categoryEditorView: { categories: categoriesSettings },
    };
    return update(state, settings);
};

const ceUpdateSelectedSubcategories = (state, action) => {
    const { level, subcategoryId } = action;
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const categoryIndex = categories.findIndex(
        d => getCategoryIdFromCategory(d) === activeCategoryId,
    );
    const category = categories[categoryIndex];
    const length = category.selectedSubcategories.length;

    const settings = {
        categoryEditorView: {
            categories: {
                [categoryIndex]: {
                    selectedSubcategories: {
                        $splice: [[level, length, subcategoryId]],
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const ceUpdateSelectedSubcategory = (state, action) => {
    const { subcategory } = action;
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const settingAction = '$splice';
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );

    const lastIndex = indices.splice(indices.length - 1)[0];
    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        [[lastIndex, 1, subcategory]],
        newSubcategoryWrapper,
    );

    const settings = {
        categoryEditorView: {
            categories: categoriesSettings,
        },
    };

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [CE__ADD_NEW_CATEGORY]: ceAddNewCategory,
    [CE__SET_ACTIVE_CATEGORY_ID]: ceSetActiveCategoryId,
    [CE__ADD_NEW_SUBCATEGORY]: ceAddNewSubcategory,
    [CE__UPDATE_SELECTED_SUBCATEGORIES]: ceUpdateSelectedSubcategories,
    [CE__UPDATE_SELECTED_SUBCATEGORY]: ceUpdateSelectedSubcategory,
};
export default reducers;
