import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';

import { afStrings } from '../../../../common/constants';

const dateWidget = {
    id: 'dateWidget',
    title: afStrings.dateWidgetLabel,
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 240, height: 48 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default dateWidget;
