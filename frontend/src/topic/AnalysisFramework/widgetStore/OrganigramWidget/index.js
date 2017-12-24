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
    id: 'organigramWidget',
    title: 'Organigram',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 216, height: 288 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default multiselectWidget;
