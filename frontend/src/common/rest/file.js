import { wsEndpoint } from './index';

export const urlForUpload = `${wsEndpoint}/files/`;
export const createHeaderForFileUpload = ({ access }) => ({
    Authorization: `Bearer ${access}`,
});

