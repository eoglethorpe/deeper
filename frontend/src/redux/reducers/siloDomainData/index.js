import createReducerWithMap from '../../../utils/createReducerWithMap';

import commonReducers from './common';
import addLeadsReducers from './addLeads';
import analysisFrameworkReducers from './analysisFramework';
import assessmentRegistryReducers from './assessmentRegistry';
import categoryEditorReducers from './categoryEditor';
import editEntriesReducers from './editEntries';
import entriesReducers from './entries';
import leadsReducers from './leads';
import galleryFilesReducers from './galleryFiles';
import visualizationReducers from './visualization';
import editAryReducers from './editAry';
import regionsReducers from './regions';
import connectorsReducers from './connectors';

import initialSiloDomainData from '../../initial-state/siloDomainData';

const reducers = {
    ...addLeadsReducers,
    ...analysisFrameworkReducers,
    ...assessmentRegistryReducers,
    ...categoryEditorReducers,
    ...commonReducers,
    ...editEntriesReducers,
    ...entriesReducers,
    ...leadsReducers,
    ...galleryFilesReducers,
    ...visualizationReducers,
    ...editAryReducers,
    ...regionsReducers,
    ...connectorsReducers,
};

const reducer = createReducerWithMap(reducers, initialSiloDomainData);
export default reducer;
