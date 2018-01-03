import { createSelector } from 'reselect';
import { analysisFrameworkIdFromProps } from '../domainData';

const analysisFrameworkViewSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworkView
);

export const afViewAnalysisFrameworkSelector = createSelector(
    analysisFrameworkViewSelector,
    afView => afView.analysisFramework,
);

export const afViewCurrentAnalysisFrameworkSelector = createSelector(
    analysisFrameworkIdFromProps,
    afViewAnalysisFrameworkSelector,
    (id, analysisFramework) => (
        (analysisFramework && analysisFramework.id === +id) ? analysisFramework : undefined
    ),
);
