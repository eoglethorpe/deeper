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

import { afStrings } from '../../../../common/constants';

const excerptTextWidget = {
    id: 'excerptWidget',
    title: afStrings.excerptWidgetLabel,
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

export default excerptTextWidget;
