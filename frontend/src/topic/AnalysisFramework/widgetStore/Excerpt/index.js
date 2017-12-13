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
    id: 'excerptWidget',
    title: 'Excerpt',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { width: 200, height: 50 },
        listMinSize: { width: 200, height: 50 },
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
