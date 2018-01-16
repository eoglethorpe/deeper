// eslint-disable-next-line import/prefer-default-export
export const serverAddressSelector = ({ settings }) => (
    settings.serverAddress || ''
);
