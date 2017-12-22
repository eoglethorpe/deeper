import {
    // FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

// import {
//     // TaggingOverviewWidget,
//     TaggingListWidget,
// } from './Tagging';

import {
    ViewListWidget,
} from './View';

const dateInformationWidget = {
    id: 'multiselectWidget',
    title: 'Multiselect',
    analysisFramework: {
        // overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        // overviewMinSize: { width: 216, height: 288 },
        listMinSize: { width: 216, height: 288 },
    },
    // tagging: {
    //     // overviewComponent: TaggingOverviewWidget,
    //     listComponent: TaggingListWidget,
    // },
    view: {
        listComponent: ViewListWidget,
    },
};

export default dateInformationWidget;
