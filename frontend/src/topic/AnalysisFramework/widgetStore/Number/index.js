import {
    // FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

import {
    // TaggingOverviewWidget,
    TaggingListWidget,
} from './Tagging';

import {
    ViewListWidget,
} from './View';

const numberWidget = {
    id: 'numberWidget',
    title: 'Number',
    analysisFramework: {
        // overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        // overviewMinSize: { width: 196, height: 72 },
        listMinSize: { width: 196, height: 72 },
    },
    tagging: {
        // overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default numberWidget;
