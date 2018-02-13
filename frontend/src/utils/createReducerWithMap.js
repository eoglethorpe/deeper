const createReducerWithMap = (reducers, initialState) => (state = initialState, action) => {
    const { type } = action;
    const reducer = reducers[type];
    if (!reducer) {
        return state;
    }
    return reducer(state, action);
};
export default createReducerWithMap;
