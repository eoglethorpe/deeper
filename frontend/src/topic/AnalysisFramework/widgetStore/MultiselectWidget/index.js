import {
    FrameworkListWidget,
} from './Framework';
import {
    TaggingListWidget,
} from './Tagging';
import {
    ViewListWidget,
} from './View';

const multiselectWidget = {
    id: 'multiselectWidget',
    // NOTE: used as afStrings('multiselectWidgetLabel')
    title: 'multiselectWidgetLabel',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 192, height: 240 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default multiselectWidget;
