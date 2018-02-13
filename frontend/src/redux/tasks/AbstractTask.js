export default class AbstractTask {
    start() {
        console.err(this);
        throw new Error('start() not implemented for Task');
    }

    stop() {
        console.err(this);
        throw new Error('stop() not implemented for Task');
    }
}
