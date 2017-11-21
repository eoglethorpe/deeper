import SiloTasksManager from '../tasks/SiloTasksManager';
import TokenRefresher from '../tasks/TokenRefresher';

export const START_SILO_BACKGROUND_TASKS = 'silo-bg-tasks/START';
export const STOP_SILO_BACKGROUND_TASKS = 'silo-bg-tasks/STOP';

export const startSiloBackgroundTasksAction = callback => ({
    type: START_SILO_BACKGROUND_TASKS,
    callback,
});

export const stopSiloBackgroundTasksAction = () => ({
    type: STOP_SILO_BACKGROUND_TASKS,
});


const siloBackgroundTasks = (store) => {
    const siloBackgroundTaskManager = new SiloTasksManager('background');

    // Add tasks to siloBackgroundTaskManager
    siloBackgroundTaskManager.addTask(new TokenRefresher(store, 1000 * 60 * 10));

    return next => (action) => {
        switch (action.type) {
            case START_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager.start().then(() => {
                    if (action.callback) {
                        action.callback();
                    }
                });
                break;
            case STOP_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager.stop();
                break;
            default:
        }
        return next(action);
    };
};

export default siloBackgroundTasks;
