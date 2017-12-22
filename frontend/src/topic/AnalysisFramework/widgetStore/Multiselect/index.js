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

const dateInformationWidget = {
    id: 'multiselectWidget',
    title: 'Multiselect',
    analysisFramework: {
        // overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        // overviewMinSize: { width: 240, height: 96 },
        listMinSize: { width: 192, height: 144 },
    },
    tagging: {
        // overviewComponent: TaggingOverviewWidget,
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default dateInformationWidget;
