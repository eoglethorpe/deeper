import update from '../../../public/utils/immutable-update';
import { isEqualAndTruthy } from '../../../public/utils/common';

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
    return update(state, settings);
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
    const existingFilters = analysisFramework.filters.filter(
        f => getFilterWidgetKey(f) === widget.key,
    );

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
            const index = existingFilters.findIndex(f => getFilterKey(f) === filter.key);
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
