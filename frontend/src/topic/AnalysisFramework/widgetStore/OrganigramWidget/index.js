import {
    FrameworkListWidget,
} from './Framework';
import {
    TaggingListWidget,
} from './Tagging';
import {
    ViewListWidget,
} from './View';
import { afStrings } from '../../../../common/constants';

const multiselectWidget = {
    id: 'organigramWidget',
    title: afStrings.organigramWidgetLabel,
    analysisFramework: {
        listComponent: FrameworkListWidget,
        listMinSize: { width: 216, height: 108 },
    },
    tagging: {
        listComponent: TaggingListWidget,
    },
    view: {
        listComponent: ViewListWidget,
    },
};

export default multiselectWidget;
