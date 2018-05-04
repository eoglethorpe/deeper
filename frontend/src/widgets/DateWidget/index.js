import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const dateWidget = {
    id: 'dateWidget',
    // NOTE: used as _ts('af', 'dateWidgetLabel')
    title: 'dateWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 240, height: 48 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default dateWidget;
