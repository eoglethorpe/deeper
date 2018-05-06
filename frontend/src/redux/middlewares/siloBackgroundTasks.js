import SiloTasksManager from '../../utils/SiloTasksManager';

import TokenRefresher from './tasks/TokenRefresher';
import ProjectGet from './tasks/ProjectGet';
import PreferencesGet from './tasks/PreferencesGet';

export const START_SILO_BACKGROUND_TASKS = 'siloBgTasks/START';
export const STOP_SILO_BACKGROUND_TASKS = 'siloBgTasks/STOP';

export const startSiloBackgroundTasksAction = callback => ({
    type: START_SILO_BACKGROUND_TASKS,
    callback,
});

export const stopSiloBackgroundTasksAction = () => ({
    type: STOP_SILO_BACKGROUND_TASKS,
});


const siloBackgroundTasks = (store) => {
    const projectGetter = new ProjectGet(store);
    const preferencesGetter = new PreferencesGet(store);
    const tokenRefresher = new TokenRefresher(store);

    const siloBackgroundTaskManager = new SiloTasksManager('background');
    siloBackgroundTaskManager.addTask(tokenRefresher);

    return next => (action) => {
        switch (action.type) {
            case START_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager
                    .start()
                    .then(() => {
                        if (action.callback) {
                            action.callback();
                        }
                    });

                projectGetter.start();
                preferencesGetter.start();
                break;
            case STOP_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager.stop();

                projectGetter.stop();
                preferencesGetter.stop();
                break;
            default:
        }
        return next(action);
    };
};

export default siloBackgroundTasks;
