import { createSelector } from 'reselect';
import {
    analysisFrameworksSelector,
    projectsSelector,
    leadIdFromRoute,
} from '../domainData';

const emptyList = [];
const emptyObject = {};

const editEntryViewSelector = ({ siloDomainData }) => (
    siloDomainData.editEntryView || emptyObject
);

export const editEntryViewForLeadIdSelector = createSelector(
    leadIdFromRoute,
    editEntryViewSelector,
    (leadId, editEntryView) => editEntryView[leadId] || emptyObject,
);

export const editEntryViewCurrentLeadSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.lead || emptyObject,
);

export const editEntryViewSelectedEntryIdSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.selectedEntryId,
);

export const editEntryViewEntriesSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.entries || emptyList,
);

export const editEntryViewCurrentProjectSelector = createSelector(
    editEntryViewCurrentLeadSelector,
    projectsSelector,
    (lead, projects) => (lead.project && projects[lead.project]) || emptyObject,
);

export const editEntryViewCurrentAnalysisFrameworkSelector = createSelector(
    editEntryViewCurrentProjectSelector,
    analysisFrameworksSelector,
    (project, analysisFrameworks) => (
        (project.analysisFramework && analysisFrameworks[project.analysisFramework]) || emptyObject
    ),
);
