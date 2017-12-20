import {
    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,
} from '../../action-types/siloDomainData';
import reducers from './analysisFramework.js';


test('should set analaysis framework', () => {
    const state = {
        analysisFrameworkView: { },
    };

    const action = {
        type: AF__SET_ANALYSIS_FRAMEWORK,
        analysisFramework: { id: 1 },
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: { id: 1 },
        },
    };

    expect(reducers[AF__SET_ANALYSIS_FRAMEWORK](state, action)).toEqual(after);
});

test('should skip adding widget', () => {
    const state = {
        analysisFrameworkView: { },
    };

    const action = {
        type: AF__VIEW_ADD_WIDGET,
        widget: { key: '1', name: 'widget1' },
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should skip adding widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {},
        },
    };

    const action = {
        type: AF__VIEW_ADD_WIDGET,
        widget: { key: '1', name: 'widget1' },
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: {},
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should add widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: { id: 1 },
        },
    };

    const action = {
        type: AF__VIEW_ADD_WIDGET,
        widget: { key: '1', name: 'widget1' },
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [{ key: '1', name: 'widget1' }],
            },
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should remove widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
            },
        },
    };

    const action = {
        type: AF__REMOVE_WIDGET,
        widgetId: '2',
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                ],
            },
        },
    };
    expect(reducers[AF__REMOVE_WIDGET](state, action)).toEqual(after);
});

test('should update widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
            },
        },
    };

    const action = {
        type: AF__VIEW_UPDATE_WIDGET,
        widget: { key: '1', name: 'widget3' },
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget3' },
                    { key: '2', name: 'widget2' },
                ],
            },
        },
    };
    expect(reducers[AF__VIEW_UPDATE_WIDGET](state, action)).toEqual(after);
});

test('should skip updating widget', () => {
    const state = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
            },
        },
    };

    const action = {
        type: AF__VIEW_UPDATE_WIDGET,
        widget: { key: '3', name: 'widget3' },
        analysisFrameworkId: 1,
    };
    const after = {
        analysisFrameworkView: {
            analysisFramework: {
                id: 1,
                widgets: [
                    { key: '1', name: 'widget1' },
                    { key: '2', name: 'widget2' },
                ],
            },
        },
    };
    expect(reducers[AF__VIEW_UPDATE_WIDGET](state, action)).toEqual(after);
});
