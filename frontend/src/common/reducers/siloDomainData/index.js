import createReducerWithMap from '../../utils/createReducerWithMap';

import commonReducers from './common';
import addLeadsReducers from './addLeads';
import analysisFrameworkReducers from './analysisFramework';
import categoryEditorReducers from './categoryEditor';
import editEntriesReducers from './editEntries';
import entriesReducers from './entries';
import leadsReducers from './leads';
import galleryFilesReducers from './galleryFiles';
import visualizationReducers from './visualization';

import initialSiloDomainData from '../../initial-state/siloDomainData';

const reducers = {
    ...addLeadsReducers,
    ...analysisFrameworkReducers,
    ...categoryEditorReducers,
    ...commonReducers,
    ...editEntriesReducers,
    ...entriesReducers,
    ...leadsReducers,
    ...galleryFilesReducers,
    ...visualizationReducers,
};

const reducer = createReducerWithMap(reducers, initialSiloDomainData);
export default reducer;
