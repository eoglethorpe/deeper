import excerptWidget from './ExcerptWidget';
import matrix1dWidget from './Matrix1dWidget';
import matrix2dWidget from './Matrix2dWidget';
import dateWidget from './DateWidget';
import numberWidget from './NumberWidget';
import multiselectWidget from './MultiselectWidget';
import scaleWidget from './ScaleWidget';
import organigramWidget from './OrganigramWidget';
import numberMatrixWidget from './NumberMatrixWidget';
import geoWidget from './GeoWidget';

// Using list to maintain ordering
const widgetStore = [
    excerptWidget,
    matrix1dWidget,
    matrix2dWidget,
    numberMatrixWidget,
    dateWidget,
    numberWidget,
    multiselectWidget,
    scaleWidget,
    organigramWidget,
    geoWidget,
];

export default widgetStore;
