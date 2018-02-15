import { wsEndpoint } from '../config/rest';

// TODO: use p()
// eslint-disable-next-line import/prefer-default-export
export const createUrlForLeadFilterOptions = projectId => (
    `${wsEndpoint}/lead-options/?project=${projectId}`
);
