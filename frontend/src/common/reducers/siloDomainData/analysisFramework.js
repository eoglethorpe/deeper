import update from '../../../public/utils/immutable-update';
import {
    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,
} from '../../action-types/siloDomainData';

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

const afViewAddWidget = (state, { analysisFrameworkId, widget }) => {
    const { analysisFrameworkView } = state;
    const { analysisFramework } = analysisFrameworkView;
    if (!analysisFramework ||
        !analysisFramework.widgets ||
        analysisFramework.id !== analysisFrameworkId) {
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

const afViewRemoveWidget = (state, { analysisFrameworkId, widgetId }) => {
    const { analysisFrameworkView } = state;
    const { analysisFramework } = analysisFrameworkView;
    if (!analysisFramework ||
        !analysisFramework.widgets ||
        analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const existingWidgets = analysisFramework.widgets;
    const index = existingWidgets.findIndex(w => w.key === widgetId);

    if (index !== -1) {
        const settings = {
            analysisFrameworkView: {
                analysisFramework: {
                    widgets: { $splice: [[index, 1]] },
                },
            },
        };
        return update(state, settings);
    }
    return state;
};

const afViewUpdateWidget = (state, { analysisFrameworkId, widget }) => {
    const { analysisFrameworkView } = state;
    const { analysisFramework } = analysisFrameworkView;
    if (!analysisFramework ||
        !analysisFramework.widgets ||
        analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const existingWidgets = analysisFramework.widgets;
    const index = existingWidgets.findIndex(w => w.key === widget.key);

    if (index !== -1) {
        const settings = {
            analysisFrameworkView: {
                analysisFramework: {
                    widgets: { $splice: [[index, 1, widget]] },
                },
            },
        };
        return update(state, settings);
    }
    return state;
};

// REDUCER MAP

const reducers = {
    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,
};
export default reducers;
