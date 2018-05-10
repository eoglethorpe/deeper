module.exports = (env) => {
    const NODE_ENV = env.NODE_ENV ? env.NODE_ENV : 'development';

    const reduceFn = (acc, key) => {
        acc[key] = JSON.stringify(process.env[key]);
        return acc;
    };
    const initialState = { NODE_ENV: JSON.stringify(NODE_ENV) };

    const ENV_VARS = Object.keys(process.env)
        .filter(v => v.startsWith('REACT_APP_'))
        .reduce(reduceFn, initialState);
    return ENV_VARS;
};
