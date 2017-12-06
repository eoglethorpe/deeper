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
    id: 'excerptTextWidget',
    title: 'Excerpt',
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
