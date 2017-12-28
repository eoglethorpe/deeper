import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const numberWidget = {
    id: 'numberWidget',
    title: 'Number',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 160, height: 48 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default numberWidget;
