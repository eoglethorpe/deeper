import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';
import {
    TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';
import { ViewListWidget } from './View';

const excerptWidget = {
    id: 'matrix1dWidget',
    title: 'Matrix 1D',
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
    view: {
        listComponent: ViewListWidget,
    },
};

export default excerptWidget;
