import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const scaleWidget = {
    id: 'scaleWidget',
    title: 'Scale',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 72, height: 64 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default scaleWidget;
