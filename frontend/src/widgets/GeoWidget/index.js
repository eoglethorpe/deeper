import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const geoWidget = {
    id: 'geoWidget',
    // NOTE: used as _ts('af', 'geoWidgetLabel')
    title: 'geoWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 160, height: 192 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default geoWidget;
