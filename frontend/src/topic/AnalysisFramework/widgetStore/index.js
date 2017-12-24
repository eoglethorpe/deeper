import excerptWidget from './ExcerptWidget';
import matrix1dWidget from './Matrix1dWidget';
import dateWidget from './DateWidget';
import numberWidget from './NumberWidget';
import multiselectWidget from './MultiselectWidget';
import scaleWidget from './ScaleWidget';
import organigramWidget from './OrganigramWidget';

// Using list to maintain ordering
const widgetStore = [
    excerptWidget,
    matrix1dWidget,
    dateWidget,
    numberWidget,
    multiselectWidget,
    scaleWidget,
    organigramWidget,
];

export default widgetStore;
