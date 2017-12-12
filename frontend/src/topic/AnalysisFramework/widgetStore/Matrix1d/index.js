import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

import {
    TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';

import {
    ViewListWidget,
} from './View';

const excerptTextWidget = {
    id: 'matrix1dWidget',
    title: 'Matrix 1D',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
    },
    tagging: {
        overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default excerptTextWidget;
