export const serverAddressSelector = ({ settings }) => (
    settings.serverAddress || ''
);

export const apiAddressSelector = ({ settings }) => (
    settings.apiAddress || ''
);
