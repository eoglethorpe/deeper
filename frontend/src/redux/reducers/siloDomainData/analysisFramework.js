import update from '../../../vendor/react-store/utils/immutable-update';
import { isEqualAndTruthy } from '../../../vendor/react-store/utils/common';
import widgetStore from '../../../widgets';

// TYPE

export const AF__SET_ANALYSIS_FRAMEWORK = 'silo-domain-data/AF__SET_ANALYSIS_FRAMEWORK';

export const AF__VIEW_ADD_WIDGET = 'silo-domain-data/AF__VIEW_ADD_WIDGET';
export const AF__REMOVE_WIDGET = 'silo-domain-data/AF__REMOVE_WIDGET';
export const AF__VIEW_UPDATE_WIDGET = 'silo-domain-data/AF_VIEW_UPDATE_WIDGET';

// CREATOR

export const setAfViewAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: AF__SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const addAfViewWidgetAction = ({
    analysisFrameworkId,
    widget,
    filters,
    exportable,
}) => ({
    type: AF__VIEW_ADD_WIDGET,
    analysisFrameworkId,
    widget,
    filters,
    exportable,
});

export const removeAfViewWidgetAction = ({
    analysisFrameworkId,
    widgetId,
}) => ({
    type: AF__REMOVE_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAfViewWidgetAction = ({
    analysisFrameworkId,
    widget,
    filters,
    exportable,
}) => ({
    type: AF__VIEW_UPDATE_WIDGET,
    analysisFrameworkId,
    widget,
    filters,
    exportable,
});

// HELPER

const isAnalysisFrameworkValid = (af = {}, id) => isEqualAndTruthy(id, af.id);

const getWidgetKey = widget => widget.key;
const getFilterKey = filter => filter.key;
const getFilterWidgetKey = filter => filter.widgetKey;
const getExportableWidgetKey = exportable => exportable.widgetKey;

const createWidgetKeyComparator = key => (w => w.key === key);

// Check collision of widget at `index` with all other widgets
// using layout corresponding to `layoutKey` in the properties.
const checkCollision = (widgets, layoutKey, index) => {
    const rect1 = widgets[index].properties[layoutKey];
    for (let i = 0; i < widgets.length; i += 1) {
        if (i !== index) {
            const rect2 = widgets[i].properties[layoutKey];
            if (
                (rect1.left < rect2.left + rect2.width) &&
                (rect1.left + rect1.width > rect2.left) &&
                (rect1.top < rect2.top + rect2.height) &&
                (rect1.height + rect1.top > rect2.top)
            ) {
                return true;
            }
        }
    }
    return false;
};

// Get height of widget using layout corresponding to `layoutKey`
// in the properties.
const getHeightOfWidget = layoutKey => widget => (
    widget.properties[layoutKey].top + widget.properties[layoutKey].height
);


// Validate an analysis framework and returns new one with
// updated widgets.
const getValidatedAnalysisFramework = (analysisFramework) => {
    let widgets = analysisFramework.widgets;

    // Collect the widgets of overview page
    const overviewWidgetIds = widgetStore.filter(
        widget => widget.analysisFramework.overviewComponent,
    ).map(widget => widget.id);

    let overviewWidgets = widgets.filter(w => overviewWidgetIds.indexOf(w.widgetId) >= 0);

    // Get max height of all widgets
    let maxOverviewHeight = Math.max(
        ...overviewWidgets.map(getHeightOfWidget('overviewGridLayout')),
    );

    let settings = {};
    // Go through each widget, to check for collision
    for (let i = overviewWidgets.length - 1; i >= 1; i -= 1) {
        // If this widget collide with any, ...
        if (checkCollision(overviewWidgets, 'overviewGridLayout', i)) {
            // Move it's top to max height
            settings[i] = {
                properties: {
                    overviewGridLayout: {
                        top: { $set: maxOverviewHeight },
                    },
                },
            };

            // Update max height
            maxOverviewHeight += overviewWidgets[i].properties.overviewGridLayout.height;
            // Update the widgets
            overviewWidgets = update(overviewWidgets, settings);

            // Update thr original widget list as well
            const widgetIndex = widgets.findIndex(
                createWidgetKeyComparator(overviewWidgets[i].key),
            );
            widgets = update(widgets, {
                [widgetIndex]: settings[i],
            });
        }
    }

    // Do the same for list widgets
    const listWidgetIds = widgetStore.filter(
        widget => widget.analysisFramework.listComponent,
    ).map(widget => widget.id);

    let listWidgets = widgets.filter(w => listWidgetIds.indexOf(w.widgetId) >= 0);
    let maxListHeight = Math.max(
        ...listWidgets.map(getHeightOfWidget('listGridLayout')),
    );

    settings = {};
    for (let i = listWidgets.length - 1; i >= 1; i -= 1) {
        if (checkCollision(listWidgets, 'listGridLayout', i)) {
            settings[i] = {
                properties: {
                    listGridLayout: {
                        top: { $set: maxListHeight },
                    },
                },
            };
            maxListHeight += listWidgets[i].properties.listGridLayout.height;
            listWidgets = update(listWidgets, settings);

            const widgetIndex = widgets.findIndex(
                createWidgetKeyComparator(listWidgets[i].key),
            );
            widgets = update(widgets, {
                [widgetIndex]: settings[i],
            });
        }
    }

    // Return updates widget list
    return update(analysisFramework, {
        widgets: { $set: widgets },
    });
};

// REDUCER

const afViewSetAnalysisFramework = (state, action) => {
    const { analysisFramework } = action;
    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                $set: analysisFramework,
            },
        },
    };
    return update(state, settings);
};

const afViewAddWidget = (state, action) => {
    const { analysisFrameworkId, widget, filters, exportable } = action;
    const { analysisFrameworkView: { analysisFramework } } = state;
    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: {
                    $autoArray: { $push: [widget] },
                },
            },
        },
    };

    if (filters) {
        settings.analysisFrameworkView.analysisFramework.filters = {
            $autoArray: {
                $push: filters.map(f => ({ ...f, widgetKey: widget.key })),
            },
        };
    }

    if (exportable) {
        settings.analysisFrameworkView.analysisFramework.exportables = {
            $autoArray: {
                $push: [{ ...exportable, widgetKey: widget.key }],
            },
        };
    }

    const newState = update(state, settings);
    const newSettings = {
        analysisFrameworkView: {
            analysisFramework: { $set: getValidatedAnalysisFramework(
                newState.analysisFrameworkView.analysisFramework,
            ) },
        },
    };

    return update(newState, newSettings);
};

const afViewRemoveWidget = (state, action) => {
    const { analysisFrameworkId, widgetId } = action;
    const { analysisFrameworkView: { analysisFramework } } = state;
    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: { $filter: w => getWidgetKey(w) !== widgetId },
                filters: { $filter: f => getFilterWidgetKey(f) !== widgetId },
                exportables: { $filter: e => getExportableWidgetKey(e) !== widgetId },
            },
        },
    };
    return update(state, settings);
};

const afViewUpdateWidget = (state, action) => {
    const { analysisFrameworkId, widget, filters, exportable } = action;
    const { analysisFrameworkView: { analysisFramework } } = state;
    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widget.key);

    if (widgetIndex === -1) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: {
                    [widgetIndex]: { $merge: widget },
                },
            },
        },
    };

    if (filters) {
        let filterSettings = {};

        filters.forEach((filter) => {
            const index = analysisFramework.filters.findIndex(
                f => getFilterKey(f) === filter.key,
                f => getFilterWidgetKey(f) === widget.key,
            );

            if (index === -1) {
                filterSettings.$push = [{ ...filter, widgetKey: widget.key }];
            } else {
                filterSettings = {
                    ...filterSettings,
                    [index]: {
                        $merge: { ...filter, widgetKey: widget.key },
                    },
                };
            }
        });

        if (Object.keys(filterSettings).length > 0) {
            settings.analysisFrameworkView.analysisFramework.filters = filterSettings;
        }
    }

    if (exportable) {
        let exportableSettings = {};
        const index = analysisFramework.exportables.findIndex(
            e => getExportableWidgetKey(e) === widget.key,
        );

        if (index === -1) {
            exportableSettings = {
                $push: [{ ...exportable, widgetKey: widget.key }],
            };
        } else {
            exportableSettings = {
                [index]: { $merge: { ...exportable, widgetKey: widget.key } },
            };
        }
        settings.analysisFrameworkView.analysisFramework.exportables = exportableSettings;
    }
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,
};
export default reducers;
