import excerptWidget from './ExcerptWidget';
import matrix1dWidget from './Matrix1dWidget';
import dateWidget from './DateWidget';
import numberWidget from './NumberWidget';
import multiselectWidget from './MultiselectWidget';
import scaleWidget from './ScaleWidget';

// Using list to maintain ordering
const widgetStore = [
    excerptWidget,
    matrix1dWidget,
    dateWidget,
    numberWidget,
    multiselectWidget,
    scaleWidget,
];

export default widgetStore;
