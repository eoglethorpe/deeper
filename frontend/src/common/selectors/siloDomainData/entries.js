import { createSelector } from 'reselect';
import {
    analysisFrameworksSelector,
    projectsSelector,
    projectIdFromRoute,
} from '../domainData';
import widgetStore from '../../../topic/AnalysisFramework/widgetStore';

const emptyList = [];
const emptyObject = {};

const entriesViewSelector = ({ siloDomainData }) => siloDomainData.entriesView;

export const entriesViewForProjectSelector = createSelector(
    entriesViewSelector,
    projectIdFromRoute,
    (entriesView, activeProject) => (
        entriesView[activeProject] || emptyObject
    ),
);

export const entriesViewFilterSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.filter || emptyObject,
);


export const entriesViewActivePageSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.activePage || 1,
);

export const totalEntriesCountForProjectSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.totalEntriesCount || 0,
);

export const entriesForProjectSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.entries || emptyList,
);

export const analysisFrameworkForProjectSelector = createSelector(
    projectIdFromRoute,
    projectsSelector,
    analysisFrameworksSelector,
    (projectId, projects, analysisFrameworks) => (
        (projects[projectId].analysisFramework
            && analysisFrameworks[projects[projectId].analysisFramework]) || emptyObject
    ),
);

// Test
export const widgetsSelector = createSelector(
    () => widgetStore
        .filter(widget => widget.view.listComponent)
        .map(widget => ({
            id: widget.id,
            title: widget.title,
            listComponent: widget.view.listComponent,
        })),
);

export const itemsForProjectSelector = createSelector(
    analysisFrameworkForProjectSelector,
    widgetsSelector,
    (analysisFramework, widgets) => {
        if (!analysisFramework.widgets) {
            return [];
        }
        return analysisFramework.widgets.filter(
            w => widgets.find(w1 => w1.id === w.widgetId),
        );
    },
);

export const maxHeightForProjectSelector = createSelector(
    itemsForProjectSelector,
    items => items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top);
        },
        0,
    ),
);

export const filtersForProjectSelector = createSelector(
    analysisFrameworkForProjectSelector,
    itemsForProjectSelector,
    (analysisFramework, items) => {
        if (!analysisFramework.filters) {
            return [];
        }
        return analysisFramework.filters.filter(
            f => items.find(item => item.key === f.widgetKey),
        );
    },
);


const getAttribute = (attributes = [], widgetId) => {
    const attribute = attributes.find(attr => attr.widget === widgetId);
    return attribute ? attribute.data : undefined;
};

const getMiniEntry = entry => ({
    id: entry.id,
    excerpt: entry.excerpt,
    image: entry.image,
    entryType: entry.entryType,
});

export const gridItemsForProjectSelector = createSelector(
    entriesForProjectSelector,
    itemsForProjectSelector,
    (entries, items) => {
        const gridItems = {};
        entries.forEach((entryGroup) => {
            entryGroup.entries.forEach((entry) => {
                gridItems[entry.id] = items.map(
                    item => ({
                        key: item.key,
                        widgetId: item.widgetId,
                        title: item.title,
                        layout: item.properties.listGridLayout,
                        attribute: getAttribute(entry.attributes, item.id),
                        entry: getMiniEntry(entry),
                        data: item.properties.data,
                    }),
                );
            });
        });
        return gridItems;
    },
);
