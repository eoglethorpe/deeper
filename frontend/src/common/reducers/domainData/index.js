import createReducerWithMap from '../../utils/createReducerWithMap';

import analysisFrameworksReducers from './analysisFrameworks';
import categoryEditorsReducers from './categoryEditors';
import leadFilterReducers from './leadFilter';
import projectsReducers from './projects';
import regionsReducers from './regions';
import userGroupsReducers from './userGroups';
import usersReducers from './users';
import commonReducers from './common';

import initialDomainData from '../../initial-state/domainData';

const reducers = {
    ...analysisFrameworksReducers,
    ...categoryEditorsReducers,
    ...leadFilterReducers,
    ...projectsReducers,
    ...regionsReducers,
    ...userGroupsReducers,
    ...usersReducers,
    ...commonReducers,
};

const reducer = createReducerWithMap(reducers, initialDomainData);
export default reducer;
