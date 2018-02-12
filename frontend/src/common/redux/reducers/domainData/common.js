import { LOGOUT_ACTION } from '../../reducers/auth';

import initialDomainData from '../../initial-state/domainData';

// REDUCER

const logout = () => initialDomainData;

const reducers = {
    [LOGOUT_ACTION]: logout,
};

export default reducers;
