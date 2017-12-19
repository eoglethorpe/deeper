import update from '../../../public/utils/immutable-update';
import {
    CE_VIEW_ADD_NEW_CATEGORY,
    CE_VIEW_SET_ACTIVE_CATEGORY_ID,
    CE_VIEW_ADD_NEW_SUBCATEGORY,
    CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES,
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

const subcategoryWrapper = (val, i) => (i <= 0 ? val : ({ subcategories: val }));

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

const ceViewAddNewCategory = (state, action) => {
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

const ceViewSetActiveCategoryId = (state, action) => {
    const { id } = action;
    const settings = {
        categoryEditorView: {
            activeCategoryId: { $set: id },
        },
    };
    return update(state, settings);
};

const ceViewAddNewSubcategory = (state, action) => {
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
        subcategoryWrapper,
    );
    const settings = {
        categoryEditorView: { categories: categoriesSettings },
    };
    return update(state, settings);
};

const ceViewUpdateSelectedSubcategories = (state, action) => {
    const { level, subCategoryId } = action;
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const categoryIndex = categories.find(
        d => getCategoryIdFromCategory(d) === activeCategoryId,
    );
    const category = categories[categoryIndex];
    const length = category.selectedSubcategories.length;

    const settings = {
        categoryEditorView: {
            categories: {
                [categoryIndex]: {
                    selectedSubcategories: {
                        $splice: [[level, length, subCategoryId]],
                    },
                },
            },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [CE_VIEW_ADD_NEW_CATEGORY]: ceViewAddNewCategory,
    [CE_VIEW_SET_ACTIVE_CATEGORY_ID]: ceViewSetActiveCategoryId,
    [CE_VIEW_ADD_NEW_SUBCATEGORY]: ceViewAddNewSubcategory,
    [CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES]: ceViewUpdateSelectedSubcategories,
};
export default reducers;
