import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';
import {
    TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';

const numberMatrixWidget = {
    id: 'numberMatrixWidget',
    title: 'Number Matrix',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { width: 240, height: 108 },
        listMinSize: { width: 240, height: 108 },
    },
    tagging: {
        overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
};

export default numberMatrixWidget;
