import update from '../../../public/utils/immutable-update';

// TYPE

export const CE__ADD_NEW_CATEGORY = 'silo-domain-data/CE__ADD_NEW_CATEGORY';
export const CE__SET_ACTIVE_CATEGORY_ID = 'silo-domain-data/CE__SET_ACTIVE_CATEGORY_ID';
export const CE__ADD_NEW_SUBCATEGORY = 'silo-domain-data/CE__ADD_NEW_SUBCATEGORY';
export const CE__UPDATE_SELECTED_SUBCATEGORIES = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORIES';
export const CE__UPDATE_SELECTED_SUBCATEGORY = 'silo-domain-data/CE__UPDATE_SELECTED_SUBCATEGORY';
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

export const addSubcategoryNGramAction = ({ level, subcategoryId, ngram }) => ({
    type: CE__ADD_SUBCATEGORY_NGRAM,
    level,
    subcategoryId,
    ngram, // n, keyword
});


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

const createMergeSubcategoryWrapper = len => (val, i) => (
    i <= 0 || i === len ? val : ({ subcategories: val })
);

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

    const settingAction = '$unshift';
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
    const { title, description, ngrams, subcategories } = action;
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const settingAction = '$merge';
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
    );

    const subcategory = {
        title,
        description,
        ngrams,
        subcategories,
    };

    const wrapper = createMergeSubcategoryWrapper(indices.length);

    const categoriesSettings = buildSettings(
        indices,
        settingAction,
        subcategory,
        wrapper,
    );

    const settings = {
        categoryEditorView: {
            categories: categoriesSettings,
        },
    };
    return update(state, settings);
};

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

// TODO: move to utils maybe
const getLinkedListNode = (linkedList, n, selector) => {
    let newList = linkedList;

    for (let i = 0; i < n; i += 1) {
        newList = selector(newList, i);
    }

    return newList;
};

const createSubcategorySelector = indices => (d, i) => (
    d[indices[i]].subcategories
);

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
    );

    // splices indices up to level of drop target
    indices.splice(level + 1);
    // get the array where dropped subcategory belongs
    const subcategories = getLinkedListNode(
        categories,
        indices.length,
        createSubcategorySelector(indices),
    );
    // get index for the subcategory (drop target)
    const lastIndex = subcategories.findIndex(d => d.id === subcategoryId);
    // add to indices for buildSettings
    indices.push(lastIndex);
    // add to n of ngram to the indices as well for buildSettings
    indices.push(+ngram.n);

    const settingAction = '$autoPush';
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
    [CE__ADD_SUBCATEGORY_NGRAM]: ceAddSubcategoryNGram,
};
export default reducers;
