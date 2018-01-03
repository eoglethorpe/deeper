// TODO: save match directly and get data from there

export const activeProjectSelector = ({ siloDomainData }) => (
    siloDomainData.activeProject
);

export const activeCountrySelector = ({ siloDomainData }) => (
    siloDomainData.activeCountry
);
