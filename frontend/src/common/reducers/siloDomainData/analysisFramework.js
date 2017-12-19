import update from '../../../public/utils/immutable-update';
import {
    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,
} from '../../action-types/siloDomainData';

// HELPER

const isAnalysisFrameworkValid = (af, id) => (
    af && af.id === id && af.widgets
);

const getWidgetKey = widget => widget.key;

// REDUCER

const afViewSetAnalysisFramework = (state, { analysisFramework }) => {
    const settings = {
        analysisFrameworkView: {
            analysisFramework: { $auto: {
                $set: analysisFramework,
            } },
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
                widgets: { $push: [widget] },
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

    const existingWidgets = analysisFramework.widgets;
    const widgetIndex = existingWidgets.findIndex(w => getWidgetKey(w) === widgetId);

    if (widgetIndex === -1) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: { $splice: [[widgetIndex, 1]] },
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
