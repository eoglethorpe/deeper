import reducers, {
    CE__ADD_NEW_CATEGORY,
    CE__SET_ACTIVE_CATEGORY_ID,
    CE__ADD_NEW_SUBCATEGORY,
    CE__UPDATE_SELECTED_SUBCATEGORIES,
    CE__UPDATE_SELECTED_SUBCATEGORY,
    CE__ADD_SUBCATEGORY_NGRAM,
    CE__REMOVE_SUBCATEGORY_NGRAM,
    CE__REMOVE_SELECTED_SUBCATEGORY,
    CE__ADD_MANUAL_SUBCATEGORY_NGRAM,
    addNewCategoryAction,
    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    updateSelectedSubcategoryAction,
    addSubcategoryNGramAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
    addManualSubcategoryNGramAction,
} from './categoryEditor';

test('should add new category', () => {
    const state = {
        categoryEditorView: { },
    };
    const action = addNewCategoryAction({
        id: 12,
        title: 'hari',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_NEW_CATEGORY](state, action)).toEqual(after);
});

test('should add new category', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [],
                },
            ],
        },
    };
    const action = addNewCategoryAction({
        id: 13,
        title: 'shyam',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 13,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_NEW_CATEGORY](state, action)).toEqual(after);
});

test('should set active category', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [],
                },
            ],
        },
    };
    const action = setActiveCategoryIdAction(13);
    const after = {
        categoryEditorView: {
            activeCategoryId: 13,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [],
                },
            ],
        },
    };
    expect(reducers[CE__SET_ACTIVE_CATEGORY_ID](state, action)).toEqual(after);
});

// set new subcategory in first hierarchy while active in another
test('should add new subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [99],
                    subcategories: [
                        {
                            id: 99,
                            title: 'older subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addNewSubcategoryAction({
        level: 0,
        id: 100,
        title: 'new subcategory',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                        {
                            id: 99,
                            title: 'older subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should add new subcategory at start', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addNewSubcategoryAction({
        level: 0,
        id: 101,
        title: 'newer subcategory',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 13,
                    title: 'shyam',
                    selectedSubcategories: [],
                    subcategories: [],
                },
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should add new subcategory at level 1', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addNewSubcategoryAction({
        level: 1,
        id: 103,
        title: 'better subcategory',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'better subcategory',
                                    description: '',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should remove subcategory at level 1', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 105,
                                    title: 'much better subcategory',
                                    description: '',
                                    ngrams: {},
                                    subcategories: [],
                                },
                                {
                                    id: 103,
                                    title: 'better subcategory',
                                    description: '',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = removeSelectedSubcategoryAction();
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 105,
                                    title: 'much better subcategory',
                                    description: '',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__REMOVE_SELECTED_SUBCATEGORY](state, action)).toEqual(after);
});

test('should update category', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'better subcategory',
                                    description: '',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = updateSelectedSubcategoryAction({
        title: 'the best subcategory',
        description: 'we are here',
        ngrams: {},
        subcategories: [],
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__UPDATE_SELECTED_SUBCATEGORY](state, action)).toEqual(after);
});

test('should update selected categories', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = updateSelectedSubcategoriesAction({
        level: 0,
        subcategoryId: 100,
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__UPDATE_SELECTED_SUBCATEGORIES](state, action)).toEqual(after);
});

test('should add ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {
                                                0: ['wash', 'fwash'],
                                            },
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addSubcategoryNGramAction({
        level: 3,
        subcategoryId: 104,
        ngram: { n: 0, keyword: 'WASH' },
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {
                                                0: ['wash', 'fwash'],
                                            },
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should add ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {},
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addSubcategoryNGramAction({
        level: 0,
        subcategoryId: 100,
        ngram: { n: 0, keyword: 'wash' },
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {},
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                0: ['wash'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should not add duplicate ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {},
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addSubcategoryNGramAction({
        level: 0,
        subcategoryId: 100,
        ngram: { n: 0, keyword: 'wash' },
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [101, 103],
                    subcategories: [
                        {
                            id: 101,
                            title: 'newer subcategory',
                            description: '',
                            ngrams: {},
                            subcategories: [
                                {
                                    id: 103,
                                    title: 'the best subcategory',
                                    description: 'we are here',
                                    ngrams: {},
                                    subcategories: [
                                        {
                                            id: 104,
                                            title: 'baby 5',
                                            description: '',
                                            ngrams: {},
                                            subcategories: [],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                0: ['wash'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should remove ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                0: ['gram', 'wash'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = removeSubcategoryNGramAction({
        n: 0, keyword: 'wash',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                0: ['gram'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__REMOVE_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should add ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                1: ['gram'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addManualSubcategoryNGramAction({
        n: 1, keyword: 'hari',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                1: ['gram', 'hari'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_MANUAL_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should not add duplicate ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                1: ['gram'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    const action = addManualSubcategoryNGramAction({
        n: 1, keyword: 'gram',
    });
    const after = {
        categoryEditorView: {
            activeCategoryId: 12,
            categories: [
                {
                    id: 12,
                    title: 'hari',
                    selectedSubcategories: [100],
                    subcategories: [
                        {
                            id: 100,
                            title: 'new subcategory',
                            description: '',
                            ngrams: {
                                1: ['gram'],
                            },
                            subcategories: [],
                        },
                    ],
                },
            ],
        },
    };
    expect(reducers[CE__ADD_MANUAL_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});
