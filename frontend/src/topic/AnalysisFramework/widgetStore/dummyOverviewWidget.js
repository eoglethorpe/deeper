import React from 'react';

const dummyOverviewWidget = {
    id: 'dummyOverviewWidget',
    title: 'Dummy 1',
    analysisFramework: {
        overviewComponent: () => (
            <div>
                Dummy Widget 1
            </div>
        ),
        listComponent: undefined,
    },
    tagging: {
        overviewComponent: undefined,
        listComponent: () => (
            <div>
                Dummy Widget 1
            </div>
        ),
    },
    view: {
        listComponent: undefined,
    },
};

export default dummyOverviewWidget;
