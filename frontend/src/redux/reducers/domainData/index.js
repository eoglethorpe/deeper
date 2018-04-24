import createReducerWithMap from '../../../utils/createReducerWithMap';

import analysisFrameworksReducers from './analysisFrameworks';
import categoryEditorsReducers from './categoryEditors';
import assessmentRegistryReducers from './assessmentRegistry';
import leadFilterReducers from './leadFilter';
import entryFilterReducers from './entryFilter';
import projectsReducers from './projects';
import regionsReducers from './regions';
import userGroupsReducers from './userGroups';
import usersReducers from './users';
import userExportsReducers from './userExports';
import connectorReducers from './connectors';
import commonReducers from './common';

import initialDomainData from '../../initial-state/domainData';

const reducers = {
    ...analysisFrameworksReducers,
    ...categoryEditorsReducers,
    ...assessmentRegistryReducers,
    ...leadFilterReducers,
    ...entryFilterReducers,
    ...projectsReducers,
    ...regionsReducers,
    ...userGroupsReducers,
    ...usersReducers,
    ...userExportsReducers,
    ...commonReducers,
    ...connectorReducers,
};

const reducer = createReducerWithMap(reducers, initialDomainData);
export default reducer;
