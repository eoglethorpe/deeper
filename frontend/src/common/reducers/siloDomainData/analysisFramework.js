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

export const addAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF__VIEW_ADD_WIDGET,
    analysisFrameworkId,
    widget,
});

export const removeAfViewWidgetAction = ({ analysisFrameworkId, widgetId }) => ({
    type: AF__REMOVE_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF__VIEW_UPDATE_WIDGET,
    analysisFrameworkId,
    widget,
});

// HELPER

const isAnalysisFrameworkValid = (af = {}, id) => isEqualAndTruthy(id, af.id);

const getWidgetKey = widget => widget.key;

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
    const { analysisFrameworkId, widget } = action;
    const { analysisFrameworkView: { analysisFramework } } = state;
    if (!isAnalysisFrameworkValid(analysisFramework, analysisFrameworkId)) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: { $autoArray: {
                    $push: [widget],
                } },
            },
        },
    };
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
            },
        },
    };
    return update(state, settings);
};

const afViewUpdateWidget = (state, action) => {
    const { analysisFrameworkId, widget } = action;
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
                widgets: { $splice: [[widgetIndex, 1, widget]] },
            },
        },
    };
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
