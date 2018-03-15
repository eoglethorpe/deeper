import { createSelector } from 'reselect';
import {
    analysisFrameworksSelector,
    projectsSelector,
    leadIdFromRoute,
} from '../domainData';

const emptyList = [];
const emptyObject = {};

const editEntrySelector = ({ siloDomainData }) => (
    siloDomainData.editEntry || emptyObject
);

export const editEntryForLeadIdSelector = createSelector(
    leadIdFromRoute,
    editEntrySelector,
    (leadId, editEntry) => editEntry[leadId] || emptyObject,
);

export const editEntryCurrentLeadSelector = createSelector(
    editEntryForLeadIdSelector,
    editEntry => editEntry.lead || emptyObject,
);

export const editEntrySelectedEntryIdSelector = createSelector(
    editEntryForLeadIdSelector,
    editEntry => editEntry.selectedEntryId,
);

export const editEntryEntriesSelector = createSelector(
    editEntryForLeadIdSelector,
    editEntry => editEntry.entries || emptyList,
);

export const editEntryFilteredEntriesSelector = createSelector(
    editEntryEntriesSelector,
    entries => entries.filter(e => !e.markedForDelete),
);

export const editEntryCurrentProjectSelector = createSelector(
    editEntryCurrentLeadSelector,
    projectsSelector,
    (lead, projects) => (lead.project && projects[lead.project]) || emptyObject,
);

export const editEntryCurrentAnalysisFrameworkSelector = createSelector(
    editEntryCurrentProjectSelector,
    analysisFrameworksSelector,
    (project, analysisFrameworks) => (
        (project.analysisFramework && analysisFrameworks[project.analysisFramework]) || emptyObject
    ),
);
