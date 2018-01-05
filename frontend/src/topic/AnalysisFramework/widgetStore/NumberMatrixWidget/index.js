import {
    FrameworkOverviewWidget,
    FrameworkListWidget,
} from './Framework';

const numberMatrixWidget = {
    id: 'numberMatrixWidget',
    title: 'Number Matrix',
    analysisFramework: {
        overviewComponent: FrameworkOverviewWidget,
        listComponent: FrameworkListWidget,
        overviewMinSize: { width: 240, height: 108 },
        listMinSize: { width: 240, height: 108 },
    },
};

export default numberMatrixWidget;
