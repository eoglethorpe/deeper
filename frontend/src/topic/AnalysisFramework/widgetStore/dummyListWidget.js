import React from 'react';

const dummyListWidget = {
    id: 'dummyListWidget',
    title: 'Dummy 2',
    analysisFramework: {
        overviewComponent: undefined,
        listComponent: () => (
            <div>
                Dummy Widget 1
            </div>
        ),
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
        listComponent: () => (
            <div>
                Dummy Widget 1
            </div>
        ),
    },
};

export default dummyListWidget;
