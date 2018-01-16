import { wsEndpoint } from '../config/rest';

// TODO: use p()
// eslint-disable-next-line import/prefer-default-export
export const createUrlForEntryFilterOptions = projectId => (
    `${wsEndpoint}/entry-options/?project=${projectId}`
);
