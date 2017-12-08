import React from 'react';

const dummyOverviewWidget = {
    id: 'dummyOverviewWidget',
    title: 'Dummy 1',
    analysisFramework: {
        overviewComponent: () => (
            <div>
                Dummy Widget 1 (Overview)
            </div>
        ),
        listComponent: undefined,
    },
    tagging: {
        overviewComponent: () => (
            <div>
                Dummy Widget 1 (Tagging)
            </div>
        ),
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
