import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const scaleWidget = {
    id: 'scaleWidget',
    title: 'scale',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 196, height: 72 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default scaleWidget;
