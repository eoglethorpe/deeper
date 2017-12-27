import { getLinkedListNode, getElementAround } from '../../../public/utils/common';
import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_CATEGORY_EDITOR = 'silo-domain-data/SET_CATEGORY_EDITOR';
export const CE__ADD_NEW_CATEGORY = 'silo-domain-data/CE__ADD_NEW_CATEGORY';
export const CE__SET_ACTIVE_CATEGORY_ID = 'silo-domain-data/CE__SET_ACTIVE_CATEGORY_ID';
export const CE__ADD_NEW_SUBCATEGORY = 'silo-domain-data/CE__ADD_NEW_SUBCATEGORY';
export const CE__UPDATE_SELECTED_SUBCATEGORIES = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORIES';
export const CE__UPDATE_SELECTED_SUBCATEGORY = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORY';
export const CE__REMOVE_SELECTED_SUBCATEGORY = 'silo-domain-data/CE__REMOVE_SELECTED_SUBCATEGORY';
export const CE__ADD_SUBCATEGORY_NGRAM = 'silo-domain-data/CE__ADD_SUBCATEGORY_NGRAM';

export const CE__REMOVE_SUBCATEGORY_NGRAM = 'silo-domain-data/CE__REMOVE_SUBCATEGORY_NGRAM';
export const CE__ADD_MANUAL_SUBCATEGORY_NGRAM = 'silo-domain-data/CE__ADD_MANUAL_SUBCATEGORY_NGRAM';

// ACTION-CREATOR

export const setCategoryEditorAction = ({ categoryEditor }) => ({
    type: SET_CATEGORY_EDITOR,
    categoryEditor,
});

export const addNewCategoryAction = ({ categoryEditorId, id, title }) => ({
    type: CE__ADD_NEW_CATEGORY,
    categoryEditorId,
    id,
    title,
});

export const setActiveCategoryIdAction = ({ categoryEditorId, id }) => ({
    type: CE__SET_ACTIVE_CATEGORY_ID,
    categoryEditorId,
    id,
});

export const addNewSubcategoryAction = ({ categoryEditorId, level, id, title }) => ({
    type: CE__ADD_NEW_SUBCATEGORY,
    categoryEditorId,
    level,
    id,
    title,
});

export const updateSelectedSubcategoriesAction = ({ categoryEditorId, level, subcategoryId }) => ({
    type: CE__UPDATE_SELECTED_SUBCATEGORIES,
    categoryEditorId,
    level,
    subcategoryId,
});

export const updateSelectedSubcategoryAction = ({
    categoryEditorId, title, description, ngrams, subcategories,
}) => ({
    type: CE__UPDATE_SELECTED_SUBCATEGORY,
    categoryEditorId,
    title,
    description,
    ngrams,
    subcategories,
});

export const removeSelectedSubcategoryAction = ({ categoryEditorId }) => ({
    type: CE__REMOVE_SELECTED_SUBCATEGORY,
    categoryEditorId,
});

export const addSubcategoryNGramAction = ({ categoryEditorId, level, subcategoryId, ngram }) => ({
    type: CE__ADD_SUBCATEGORY_NGRAM,
    categoryEditorId,
    level,
    subcategoryId,
    ngram, // n, keyword
});

export const removeSubcategoryNGramAction = ({ categoryEditorId, ngram }) => ({
    type: CE__REMOVE_SUBCATEGORY_NGRAM,
    categoryEditorId,
    ngram, // n, keyword
});

export const addManualSubcategoryNGramAction = ({ categoryEditorId, ngram }) => ({
    type: CE__ADD_MANUAL_SUBCATEGORY_NGRAM,
    categoryEditorId,
    ngram, // n, keyword
});

// HELPERS
const getCategoryIdFromCategory = category => category.id;
const getSubcategoryIdFromSubcategory = subcategory => subcategory.id;
const getSubcategoriesFromSubcategory = subcategory => subcategory.subcategories;

const getIndicesFromSelectedCategories = (categories, activeCategoryId, stopLevel) => {
    const activeCategoryIndex = categories.findIndex(
        d => getCategoryIdFromCategory(d) === activeCategoryId,
    );
    const {
        selectedSubcategories,
        subcategories: firstSubcategories,
    } = categories[activeCategoryIndex];

    const { indices: newIndices } = selectedSubcategories.reduce(
        ({ subcategories, indices }, selected) => {
            const index = subcategories.findIndex(
                d => getSubcategoryIdFromSubcategory(d) === selected,
            );
            return {
                subcategories: getSubcategoriesFromSubcategory(subcategories[index]),
                indices: indices.concat([index]),
            };
        },
        {
            subcategories: firstSubcategories,
            indices: [activeCategoryIndex],
        },
    );

    if (stopLevel >= 0) {
        newIndices.splice(stopLevel + 1);
    }

    return newIndices;
};

const buildSettings = (indices, action, value, wrapper) => (
    // NOTE: reverse() mutates the array so making a copy
    [...indices].reverse().reduce(
        (acc, selected, index) => wrapper(
            { [selected]: acc },
            indices.length - index - 1,
        ),
        wrapper(
            { [action]: value },
            indices.length,
        ),
    )
);


// REDUCER

const setCategoryEditor = (state, action) => {
    const { categoryEditor } = action;

    const settings = {
        categoryEditorView: {
            [categoryEditor.id]: { $auto: {
                $set: categoryEditor,
            } },
        },
    };

    return update(state, settings);
};

const ceAddNewCategory = (state, action) => {
    const { categoryEditorId, id, title } = action;
    const newCategory = {
        id,
        title,
        selectedSubcategories: [],
        subcategories: [],
    };

    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    activeCategoryId: { $set: id },
                    categories: { $autoUnshift: [newCategory] },
                } },
            } },
        },
    };
    return update(state, settings);
};

const ceSetActiveCategoryId = (state, action) => {
    const { categoryEditorId, id } = action;
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    activeCategoryId: { $set: id },
                } },
            } },
        },
    };
    return update(state, settings);
};

const ceUpdateSelectedSubcategories = (state, action) => {
    const { categoryEditorId, level, subcategoryId } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
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
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    categories: {
                        [categoryIndex]: {
                            selectedSubcategories: {
                                $splice: [[level, length, subcategoryId]],
                            },
                        },
                    },
                } },
            } },
        },
    };
    return update(state, settings);
};

const ceAddNewSubcategory = (state, action) => {
    const { categoryEditorId, level, id, title } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const { categories, activeCategoryId } = categoryEditorView;

    const newSubcategory = {
        id,
        title,
        description: '',
        ngrams: {},
        subcategories: [],
    };
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
        level,
    );
    const wrapper = (val, i) => (
        i <= 0 ? val : { subcategories: val }
    );
    const categoriesSettings = buildSettings(
        indices,
        '$unshift',
        [newSubcategory],
        wrapper,
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: {
                data: {
                    categories: categoriesSettings,
                },
            },
        },
    };

    // Set new category as selected category
    const selectedCategory = categories[indices[0]];
    const length = selectedCategory.selectedSubcategories.length;

    settings
        .categoryEditorView[categoryEditorId]
        .data.categories[indices[0]].selectedSubcategories = {
            $splice: [[level, length, id]],
        };

    return update(state, settings);
};

const ceUpdateSelectedSubcategory = (state, action) => {
    const { categoryEditorId, title, description, ngrams, subcategories } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const newSubcategory = {
        title,
        description,
        ngrams,
        subcategories,
    };
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );
    const wrapper = len => (val, i) => (
        (i <= 0 || i === len) ? val : { subcategories: val }
    );
    const categoriesSettings = buildSettings(
        indices,
        '$merge',
        newSubcategory,
        wrapper(indices.length),
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    categories: categoriesSettings,
                } },
            } },
        },
    };
    return update(state, settings);
};

const ceRemoveSelectedSubcategory = (state, action) => {
    const { categoryEditorId } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );
    const lastIndex = indices[indices.length - 1];
    indices.splice(-1, 1); // remove last element

    const selector = indexList => (d, i) => (
        d[indexList[i]].subcategories
    );

    const subcategories = getLinkedListNode(
        categories,
        indices.length,
        selector(indices),
    );
    const newSelectedSubCategory = getElementAround(subcategories, lastIndex);
    const newSelectedSubCategoryId = newSelectedSubCategory ? newSelectedSubCategory.id : undefined;

    const wrapper = (val, i) => (
        i <= 0 ? val : { subcategories: val }
    );
    const categoriesSettings = buildSettings(
        indices,
        '$splice',
        [[lastIndex, 1]],
        wrapper,
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: {
                data: {
                    categories: categoriesSettings,
                },
            },
        },
    };

    // Set parent as selected category (TODO: maybe siblings)
    settings
        .categoryEditorView[categoryEditorId]
        .data.categories[indices[0]].selectedSubcategories = {
            $splice: [
                newSelectedSubCategoryId
                    ? [indices.length - 1, 1, newSelectedSubCategoryId]
                    : [indices.length - 1],
            ],
        };

    return update(state, settings);
};

const ceRemoveSubcategoryNGram = (state, action) => {
    const {
        categoryEditorId,
        ngram: { n: ngramN, keyword: ngramKeyword },
    } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const { categories, activeCategoryId } = categoryEditorView;

    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );
    // get the array where dropped subcategory belongs
    // add to n of ngram to the indices as well for build Settings
    indices.push(+ngramN);

    const wrapper = len => (val, i) => {
        if (i <= 0 || i === len) {
            // first one
            return val;
        } else if (i === len - 1) {
            // second last one ( for subcategory.ngrams[last] )
            return { ngrams: val };
        }
        // others
        return { subcategories: val };
    };
    const categoriesSettings = buildSettings(
        indices,
        '$filter',
        (gram => gram.toLowerCase() !== ngramKeyword.toLowerCase()),
        wrapper(indices.length),
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    categories: categoriesSettings,
                } },
            } },
        },
    };
    return update(state, settings);
};

const ceAddManualSubcategoryNGram = (state, action) => {
    const {
        ngram: { n: ngramN, keyword: ngramKeyword },
        categoryEditorId,
    } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const { categories, activeCategoryId } = categoryEditorView;
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );

    // Only add ngram if it doesn't exist
    const selector = indexList => (d, i) => (
        (i === indexList.length - 1)
            ? d[indexList[i]].ngrams[+ngramN]
            : d[indexList[i]].subcategories
    );
    const ngramForN = getLinkedListNode(
        categories,
        indices.length,
        selector(indices),
    );
    const ngramAlreadyThere = ngramForN && ngramForN.find(
        word => word.toLowerCase() === ngramKeyword.toLowerCase(),
    );
    if (ngramAlreadyThere) {
        return state;
    }

    // get the array where dropped subcategory belongs
    // add to n of ngram to the indices as well for build Settings
    indices.push(+ngramN);

    const wrapper = len => (val, i) => {
        if (i <= 0 || i === len) {
            // first one
            return val;
        } else if (i === len - 1) {
            // second last one ( for subcategory.ngrams[last] )
            return { ngrams: val };
        }
        // others
        return { subcategories: val };
    };
    const categoriesSettings = buildSettings(
        indices,
        '$autoUnshift',
        [ngramKeyword],
        wrapper(indices.length),
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    categories: categoriesSettings,
                } },
            } },
        },
    };
    return update(state, settings);
};

// NOTE: This is complex as ngram can be added to any visible subcategory
const ceAddSubcategoryNGram = (state, action) => {
    const {
        categoryEditorId,
        level,
        subcategoryId,
        ngram: { n: ngramN, keyword: ngramKeyword },
    } = action;
    const {
        categoryEditorView: {
            [categoryEditorId]: {
                data: categoryEditorView = {},
            } = {},
        },
    } = state;
    const { categories, activeCategoryId } = categoryEditorView;

    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
        level, // splices indices up to level of drop target
    );

    const selector = indexList => (d, i) => (
        d[indexList[i]].subcategories
    );
    // get the array where dropped subcategory belongs
    const subcategories = getLinkedListNode(
        categories,
        indices.length,
        selector(indices),
    );
    // get index for the subcategory (drop target)
    const lastIndex = subcategories.findIndex(d => d.id === subcategoryId);

    // Only add ngram if it doesn't exist
    const ngramForN = subcategories[lastIndex].ngrams[+ngramN];
    const ngramAlreadyThere = ngramForN && ngramForN.find(
        word => word.toLowerCase() === ngramKeyword.toLowerCase(),
    );
    if (ngramAlreadyThere) {
        return state;
    }

    // add to indices for build Settings
    indices.push(lastIndex);
    // add to n of ngram to the indices as well for build Settings
    indices.push(+ngramN);

    const wrapper = len => (val, i) => {
        if (i <= 0 || i === len) {
            // first one
            return val;
        } else if (i === len - 1) {
            // second last one ( for subcategory.ngrams[last] )
            return { ngrams: val };
        }
        // others
        return { subcategories: val };
    };
    const categoriesSettings = buildSettings(
        indices,
        '$autoUnshift',
        [ngramKeyword],
        wrapper(indices.length),
    );
    const settings = {
        categoryEditorView: {
            [categoryEditorId]: { $auto: {
                data: { $auto: {
                    categories: categoriesSettings,
                } },
            } },
        },
    };

    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [SET_CATEGORY_EDITOR]: setCategoryEditor,
    [CE__ADD_NEW_CATEGORY]: ceAddNewCategory,
    [CE__SET_ACTIVE_CATEGORY_ID]: ceSetActiveCategoryId,
    [CE__ADD_NEW_SUBCATEGORY]: ceAddNewSubcategory,
    [CE__UPDATE_SELECTED_SUBCATEGORIES]: ceUpdateSelectedSubcategories,
    [CE__UPDATE_SELECTED_SUBCATEGORY]: ceUpdateSelectedSubcategory,
    [CE__REMOVE_SELECTED_SUBCATEGORY]: ceRemoveSelectedSubcategory,
    [CE__ADD_SUBCATEGORY_NGRAM]: ceAddSubcategoryNGram,
    [CE__REMOVE_SUBCATEGORY_NGRAM]: ceRemoveSubcategoryNGram,
    [CE__ADD_MANUAL_SUBCATEGORY_NGRAM]: ceAddManualSubcategoryNGram,
};
export default reducers;
