import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
} from '../action-types/domainData';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

const domainDataReducer = (state = initialDomainDataState, action) => {
    switch (action.type) {
        case SET_USER_INFORMATION: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        information: {
                            $set: action.information,
                        },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_USER_PROJECTS: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        projects: {
                            $set: action.projects,
                        },
                    } },
                },
            };
            return update(state, settings);
        }
        default:
            return state;
    }
};

export default domainDataReducer;
