import { FrameworkListWidget } from './Framework';
import { TaggingListWidget } from './Tagging';
import { ViewListWidget } from './View';
import { afStrings } from '../../../../common/constants';

const geoWidget = {
    id: 'geoWidget',
    title: afStrings.geoWidgetLabel,
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 192, height: 240 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default geoWidget;
