import update from '../../../public/utils/immutable-update';

// HELPER
const getLinkedListNode = (linkedList, n, selector) => {
    let newList = linkedList;

    for (let i = 0; i < n; i += 1) {
        newList = selector(newList, i);
    }

    return newList;
};


// TYPE

export const CE__ADD_NEW_CATEGORY = 'silo-domain-data/CE__ADD_NEW_CATEGORY';
export const CE__SET_ACTIVE_CATEGORY_ID = 'silo-domain-data/CE__SET_ACTIVE_CATEGORY_ID';
export const CE__ADD_NEW_SUBCATEGORY = 'silo-domain-data/CE__ADD_NEW_SUBCATEGORY';
export const CE__UPDATE_SELECTED_SUBCATEGORIES = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORIES';
export const CE__UPDATE_SELECTED_SUBCATEGORY = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORY';
export const CE__REMOVE_SELECTED_SUBCATEGORY = 'silo-domain-data/CE__REMOVE_SELECTED_SUBCATEGORY';
export const CE__ADD_SUBCATEGORY_NGRAM = 'silo-domain-data/CE__ADD_SUBCATEGORY_NGRAM';

// ACTION-CREATOR

export const addNewCategoryAction = ({ id, title }) => ({
    type: CE__ADD_NEW_CATEGORY,
    id,
    title,
});

export const setActiveCategoryIdAction = id => ({
    type: CE__SET_ACTIVE_CATEGORY_ID,
    id,
});

export const addNewSubcategoryAction = ({ level, id, title }) => ({
    type: CE__ADD_NEW_SUBCATEGORY,
    level,
    id,
    title,
});

export const updateSelectedSubcategoriesAction = ({ level, subcategoryId }) => ({
    type: CE__UPDATE_SELECTED_SUBCATEGORIES,
    level,
    subcategoryId,
});

export const updateSelectedSubcategoryAction = ({ title, description, ngrams, subcategories }) => ({
    type: CE__UPDATE_SELECTED_SUBCATEGORY,
    title,
    description,
    ngrams,
    subcategories,
});

export const removeSelectedSubcategoryAction = () => ({
    type: CE__REMOVE_SELECTED_SUBCATEGORY,
});

export const addSubcategoryNGramAction = ({ level, subcategoryId, ngram }) => ({
    type: CE__ADD_SUBCATEGORY_NGRAM,
    level,
    subcategoryId,
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
            categories: { $autoUnshift: [newCategory] },
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

const ceAddNewSubcategory = (state, action) => {
    const { level, id, title } = action;
    const { categoryEditorView } = state;
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
    const settingAction = '$unshift';
    const newSubcategoryWrapper = (val, i) => (
        i <= 0 ? val : ({ subcategories: val })
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

    // Set new category as selected category
    const selectedCategory = categories[indices[0]];
    const length = selectedCategory.selectedSubcategories.length;
    settings.categoryEditorView.categories[indices[0]].selectedSubcategories = {
        $splice: [[level, length, id]],
    };

    return update(state, settings);
};

const ceUpdateSelectedSubcategory = (state, action) => {
    const { title, description, ngrams, subcategories } = action;
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const updatedSubcategory = {
        title,
        description,
        ngrams,
        subcategories,
    };
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );
    const settingAction = '$merge';
    const createMergeSubcategoryWrapper = len => (val, i) => (
        i <= 0 || i === len ? val : ({ subcategories: val })
    );
    const wrapper = createMergeSubcategoryWrapper(indices.length);
    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        updatedSubcategory,
        wrapper,
    );
    const settings = {
        categoryEditorView: {
            categories: categoriesSettings,
        },
    };
    return update(state, settings);
};

const ceRemoveSelectedSubcategory = (state) => {
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );
    const lastIndex = indices[indices.length - 1];
    indices.splice(indices.length - 1, 1);

    console.log(indices);
    const settingAction = '$splice';
    const createDeleteSubcategoryWrapper = len => (val, i) => (
        i <= 0 ? val : ({ subcategories: val })
    );
    const wrapper = createDeleteSubcategoryWrapper(indices.length);
    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        [[lastIndex, 1]],
        wrapper,
    );
    const settings = {
        categoryEditorView: {
            categories: categoriesSettings,
        },
    };

    // Set new category as selected category
    // const selectedCategory = categories[indices[0]];
    // const length = selectedCategory.selectedSubcategories.length;
    settings.categoryEditorView.categories[indices[0]].selectedSubcategories = {
        $splice: [[indices.length - 1]],
    };

    return update(state, settings);
};

const ceAddSubcategoryNGram = (state, action) => {
    const {
        categoryEditorView: {
            categories,
            activeCategoryId,
        },
    } = state;
    const {
        level,
        subcategoryId,
        ngram,
    } = action;

    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
        level, // splices indices up to level of drop target
    );

    const createSubcategorySelector = indexList => (d, i) => (
        d[indexList[i]].subcategories
    );
    // get the array where dropped subcategory belongs
    const subcategories = getLinkedListNode(
        categories,
        indices.length,
        createSubcategorySelector(indices),
    );
    // get index for the subcategory (drop target)
    const lastIndex = subcategories.findIndex(d => d.id === subcategoryId);
    // add to indices for build Settings
    indices.push(lastIndex);
    // add to n of ngram to the indices as well for build Settings
    indices.push(+ngram.n);

    const settingAction = '$autoPush';
    const createAddNGramWrapper = len => (val, i) => {
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
    const addNGramWrapper = createAddNGramWrapper(indices.length);
    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        [ngram.keyword],
        addNGramWrapper,
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
    [CE__REMOVE_SELECTED_SUBCATEGORY]: ceRemoveSelectedSubcategory,
    [CE__ADD_SUBCATEGORY_NGRAM]: ceAddSubcategoryNGram,
};
export default reducers;
