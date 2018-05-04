import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';
import {
    TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';
import { ViewListWidget } from './View';

const excerptWidget = {
    id: 'matrix2dWidget',
    // NOTE: used as _ts('af', 'matrix2DWidgetLabel')
    title: 'matrix2DWidgetLabel',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { width: 240, height: 108 },
        listMinSize: { width: 240, height: 108 },
    },
    tagging: {
        overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default excerptWidget;
