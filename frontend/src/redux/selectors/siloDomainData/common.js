import { createSelector } from 'reselect';
import { currentUserProjectsSelector } from '../domainData';

const emptyObject = {};

export const activeProjectIdFromStateSelector = ({ siloDomainData }) => (
    siloDomainData.activeProject
);

export const activeProjectFromStateSelector = createSelector(
    currentUserProjectsSelector,
    activeProjectIdFromStateSelector,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);

export const activeCountryIdFromStateSelector = ({ siloDomainData }) => (
    siloDomainData.activeCountry
);
