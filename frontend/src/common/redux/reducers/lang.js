import createReducerWithMap from '../../utils/createReducerWithMap';
import initialLangState from '../initial-state/lang';

export const langReducers = {
};

const langReducer = createReducerWithMap(langReducers, initialLangState);
export default langReducer;
