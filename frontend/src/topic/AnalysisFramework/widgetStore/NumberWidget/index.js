import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';
import { afStrings } from '../../../../common/constants';

const numberWidget = {
    id: 'numberWidget',
    title: afStrings.numberWidgetLabel,
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 160, height: 48 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default numberWidget;
