import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';
import { afStrings } from '../../../../common/constants';

const scaleWidget = {
    id: 'scaleWidget',
    title: afStrings.scaleWidgetLabel,
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 96, height: 64 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default scaleWidget;
