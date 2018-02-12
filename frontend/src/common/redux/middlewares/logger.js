// eslint-disable-next-line no-unused-vars
const logger = store => next => (action) => {
    if (action) {
        console.info(`DISPATCHING ${action.type}`);
    }
    const result = next(action);
    return result;
};

export default logger;
