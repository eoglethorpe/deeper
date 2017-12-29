import reducers, {
    CE__SET_CATEGORY_EDITOR,
    CE__SET_CATEGORY,
    CE__REMOVE_CATEGORY,
    CE__ADD_NEW_CATEGORY,
    CE__SET_ACTIVE_CATEGORY_ID,
    CE__ADD_NEW_SUBCATEGORY,
    CE__UPDATE_SELECTED_SUBCATEGORIES,
    CE__UPDATE_SELECTED_SUBCATEGORY,
    CE__ADD_SUBCATEGORY_NGRAM,
    CE__REMOVE_SUBCATEGORY_NGRAM,
    CE__REMOVE_SELECTED_SUBCATEGORY,
    CE__ADD_MANUAL_SUBCATEGORY_NGRAM,
    setCategoryEditorAction,
    addNewCategoryAction,
    setCategoryAction,
    removeCategoryAction,
    setActiveCategoryIdAction,
    addNewSubcategoryAction,
    updateSelectedSubcategoriesAction,
    updateSelectedSubcategoryAction,
    addSubcategoryNGramAction,
    removeSelectedSubcategoryAction,
    removeSubcategoryNGramAction,
    addManualSubcategoryNGramAction,
} from './categoryEditor';

test('should set category editor', () => {
    const state = {
        categoryEditorView: {},
    };
    const action = setCategoryEditorAction({
        categoryEditor: {
            id: 12,
            title: 'hari',
            versionId: 1,
            data: {
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
        },
    });
    const after = {
        categoryEditorView: {
            12: {
                id: 12,
                title: 'hari',
                versionId: 1,
                pristine: true,
                data: {
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
            },
        }
    };
    expect(reducers[CE__SET_CATEGORY_EDITOR](state, action)).toEqual(after);
});

test('should add new category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'ram',
                pristine: true,
                versionId: 0,
                data: undefined,
            },
        },
    };
    const action = addNewCategoryAction({
        id: 12,
        title: 'hari',
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'ram',
                versionId: 0,
                pristine: false,
                data: {
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
            }
        },
    };
    expect(reducers[CE__ADD_NEW_CATEGORY](state, action)).toEqual(after);
});

test('should add new category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addNewCategoryAction({
        id: 13,
        title: 'shyam',
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_NEW_CATEGORY](state, action)).toEqual(after);
});

test('should set category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: true,
                data: {
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
            },
        },
    };
    const action = setCategoryAction({
        categoryEditorId: 1,
        id: 13,
        values: {
            title: 'chor',
        },
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: false,
                data: {
                    activeCategoryId: 13,
                    categories: [
                        {
                            id: 13,
                            title: 'chor',
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
            },
        },
    };
    expect(reducers[CE__SET_CATEGORY](state, action)).toEqual(after);
});

test('should remove category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: true,
                data: {
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
            },
        },
    };
    const action = removeCategoryAction({
        categoryEditorId: 1,
        id: 13,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__REMOVE_CATEGORY](state, action)).toEqual(after);
});

test('should remove category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: true,
                data: {
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
                        {
                            id: 11,
                            title: 'hari',
                            selectedSubcategories: [],
                            subcategories: [],
                        },
                    ],
                },
            },
        },
    };
    const action = removeCategoryAction({
        categoryEditorId: 1,
        id: 11,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                title: 'hari',
                versionId: 1,
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__REMOVE_CATEGORY](state, action)).toEqual(after);
});

test('should set active category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = setActiveCategoryIdAction({
        id: 13,
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    expect(reducers[CE__SET_ACTIVE_CATEGORY_ID](state, action)).toEqual(after);
});

// set new subcategory in first hierarchy while active in another
test('should add new subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addNewSubcategoryAction({
        level: 0,
        id: 100,
        title: 'new subcategory',
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should add new subcategory at start', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addNewSubcategoryAction({
        level: 0,
        id: 101,
        title: 'newer subcategory',
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should add new subcategory at level 1', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addNewSubcategoryAction({
        level: 1,
        id: 103,
        title: 'better subcategory',
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_NEW_SUBCATEGORY](state, action)).toEqual(after);
});

test('should remove subcategory at level 1', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = removeSelectedSubcategoryAction({
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
                    activeCategoryId: 12,
                    categories: [
                        {
                            id: 12,
                            title: 'hari',
                            selectedSubcategories: [101, 105],
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
            },
        },
    };
    expect(reducers[CE__REMOVE_SELECTED_SUBCATEGORY](state, action)).toEqual(after);
});

test('should remove subcategory at level 1', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = removeSelectedSubcategoryAction({
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__REMOVE_SELECTED_SUBCATEGORY](state, action)).toEqual(after);
});


test('should update category', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = updateSelectedSubcategoryAction({
        title: 'the best subcategory',
        description: 'we are here',
        ngrams: {},
        subcategories: [],
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__UPDATE_SELECTED_SUBCATEGORY](state, action)).toEqual(after);
});

test('should update selected categories', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = updateSelectedSubcategoriesAction({
        level: 0,
        subcategoryId: 100,
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    expect(reducers[CE__UPDATE_SELECTED_SUBCATEGORIES](state, action)).toEqual(after);
});

test('should add not add duplicate ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addSubcategoryNGramAction({
        level: 3,
        subcategoryId: 104,
        ngram: { n: 0, keyword: 'WASH' },
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should add ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
                                        0: ['old'],
                                    },
                                    subcategories: [],
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };
    const action = addSubcategoryNGramAction({
        level: 0,
        subcategoryId: 100,
        ngram: { n: 0, keyword: 'wash' },
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
                                        0: ['wash', 'old'],
                                    },
                                    subcategories: [],
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should add ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addSubcategoryNGramAction({
        level: 0,
        subcategoryId: 100,
        ngram: { n: 0, keyword: 'wash' },
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should remove ngram to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = removeSubcategoryNGramAction({
        ngram: {
            n: 0,
            keyword: 'wash',
        },
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
            },
        },
    };
    expect(reducers[CE__REMOVE_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should add ngram manually to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addManualSubcategoryNGramAction({
        categoryEditorId: 1,
        ngram: { n: 1, keyword: 'hari' },
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: false,
                data: {
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
                                        1: ['hari', 'gram'],
                                    },
                                    subcategories: [],
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };
    expect(reducers[CE__ADD_MANUAL_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});

test('should not add duplicate ngram manually to any given subcategory', () => {
    const state = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    const action = addManualSubcategoryNGramAction({
        ngram: {
            n: 1,
            keyword: 'gram',
        },
        categoryEditorId: 1,
    });
    const after = {
        categoryEditorView: {
            1: {
                id: 1,
                versionId: 0,
                title: 'base',
                pristine: true,
                data: {
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
            },
        },
    };
    expect(reducers[CE__ADD_MANUAL_SUBCATEGORY_NGRAM](state, action)).toEqual(after);
});
