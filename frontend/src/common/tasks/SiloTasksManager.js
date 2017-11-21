import Locker from '../../public/utils/Locker';
import AbstractTask from './AbstractTask';


export default class SiloTasksManager {
    constructor(uniqueId) {
        this.locker = undefined;
        this.lockId = `silo-tasks-${uniqueId}`;
        this.tasks = [
            // List of tasks that need to be run only by once instance
            // of SiloTasksManager
        ];
    }

    addTask(task) {
        if (!(task instanceof AbstractTask)) {
            throw new Error('Invalid task object');
        }
        this.tasks.push(task);

        return this;
    }

    start() {
        return this.stop().then(() => {
            this.locker = new Locker(this.lockId);
            return this.locker.acquire().then(() => (
                Promise.all(this.tasks.map(t => t.start()))
            ));
        });
    }

    stop() {
        if (this.locker) {
            return Promise.all(this.tasks.map(t => t.stop())).then(() => {
                this.locker.release();
                this.locker = undefined;
            });
        }

        return Promise.resolve();
    }
}
