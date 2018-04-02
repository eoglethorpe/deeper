export default class AbstractTask {
    start() {
        console.err(this);
        throw new Error('Method start is not implemented');
    }

    stop() {
        console.err(this);
        throw new Error('Method stop is not implemented');
    }
}
