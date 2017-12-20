import createReducerWithMap from '../../utils/createReducerWithMap';

import analysisFrameworksReducers from './analysisFrameworks';
import leadFilterReducers from './leadFilter';
import projectsReducers from './projects';
import regionsReducers from './regions';
import userGroupsReducers from './userGroups';
import usersReducers from './users';
import commonReducers from './common';

import initialDomainData from '../../initial-state/domainData';

const reducers = {
    ...analysisFrameworksReducers,
    ...leadFilterReducers,
    ...projectsReducers,
    ...regionsReducers,
    ...userGroupsReducers,
    ...usersReducers,
    ...commonReducers,
};

const reducer = createReducerWithMap(reducers, initialDomainData);
export default reducer;
