// eslint-disable-next-line
const logger = store => next => action => {
    if (action) {
        console.info(`DISPATCHING ${action.type}`, action);
    }
    const result = next(action);
    return result;
};

export default logger;
