import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const multiselectWidget = {
    id: 'organigramWidget',
    // NOTE: used as _ts('af', 'organigramWidgetLabel')
    title: 'organigramWidgetLabel',
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

export default multiselectWidget;
