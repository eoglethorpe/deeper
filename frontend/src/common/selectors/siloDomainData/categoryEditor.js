import { createSelector } from 'reselect';
import { categoryEditorIdFromRoute } from '../domainData';

const emptyList = [];
const emptyObject = {};

const categoryEditorsViewSelector = ({ siloDomainData }) => (
    siloDomainData.categoryEditorView || emptyObject
);

const categoryEditorViewFromRouteSelector = createSelector(
    categoryEditorsViewSelector,
    categoryEditorIdFromRoute,
    (view, id) => view[id] || emptyObject,
);

export const categoryEditorViewPristineSelector = createSelector(
    categoryEditorViewFromRouteSelector,
    view => view.pristine,
);

export const categoryEditorViewTitleSelector = createSelector(
    categoryEditorViewFromRouteSelector,
    view => view.title || '',
);

export const categoryEditorViewVersionIdSelector = createSelector(
    categoryEditorViewFromRouteSelector,
    view => view.versionId,
);

export const categoryEditorViewSelector = createSelector(
    categoryEditorViewFromRouteSelector,
    view => view.data || emptyObject,
);

export const categoriesSelector = createSelector(
    categoryEditorViewSelector,
    view => view.categories || emptyList,
);

export const activeCategoryIdSelector = createSelector(
    categoryEditorViewSelector,
    view => view.activeCategoryId,
);

export const selectedSubcategorySelector = createSelector(
    categoriesSelector,
    activeCategoryIdSelector,
    (categories, activeCategoryId) => {
        if (!activeCategoryId) {
            return undefined;
        }
        const activeCategory = categories.find(d => d.id === activeCategoryId);

        const selectedSubcategories = activeCategory.selectedSubcategories;
        if (selectedSubcategories.length === 0) {
            return undefined;
        }

        let subcategory = {};
        let subcategories = activeCategory.subcategories;
        selectedSubcategories.forEach((selected) => {
            subcategory = subcategories.find(d => d.id === selected);
            subcategories = subcategory.subcategories;
        });
        return subcategory;
    },
);
