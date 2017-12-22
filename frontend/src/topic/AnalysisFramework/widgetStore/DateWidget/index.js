import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const dateWidget = {
    id: 'dateWidget',
    title: 'Date',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 240, height: 96 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default dateWidget;
