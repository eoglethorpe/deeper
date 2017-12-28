import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

const geoWidget = {
    id: 'geoWidget',
    title: 'Geographic Location',
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 192, height: 64 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default geoWidget;
