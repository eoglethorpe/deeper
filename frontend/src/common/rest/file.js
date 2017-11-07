import { wsEndpoint } from '../config/rest';

export const urlForUpload = `${wsEndpoint}/files/`;
export const createHeaderForFileUpload = ({ access }) => ({
    Authorization: `Bearer ${access}`,
});

