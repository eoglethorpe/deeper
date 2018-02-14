import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const multiselectWidget = {
    id: 'organigramWidget',
    // NOTE: used as afStrings('organigramWidgetLabel')
    title: 'organigramWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 216, height: 108 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default multiselectWidget;
