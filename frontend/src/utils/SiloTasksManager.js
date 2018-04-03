import Locker from '../vendor/react-store/utils/Locker';

import AbstractTask from './AbstractTask';

export default class SiloTasksManager {
    constructor(uniqueId) {
        this.locker = undefined;
        this.lockId = `silo-tasks-${uniqueId}`;
        this.tasks = [
            // List of tasks that need to be run only by one instance
            // of SiloTasksManager
        ];
    }

    addTask = (task) => {
        if (!(task instanceof AbstractTask)) {
            throw new Error('Task must extend AbstractTask');
        }
        this.tasks.push(task);
        return this;
    }

    start = () => (
        this.stop()
            .then(() => {
                this.locker = new Locker(this.lockId);

                return this.locker
                    .acquire()
                    .then(() => Promise.all(this.tasks.map(t => t.start())));
            })
    )

    stop = () => {
        if (!this.locker) {
            return Promise.resolve();
        }

        return Promise.all(this.tasks.map(t => t.stop()))
            .then(() => {
                this.locker.release();
                this.locker = undefined;
            });
    }
}
