import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const scaleWidget = {
    id: 'scaleWidget',
    // NOTE: used as _ts('af', 'scaleWidgetLabel')
    title: 'scaleWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 96, height: 64 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default scaleWidget;
