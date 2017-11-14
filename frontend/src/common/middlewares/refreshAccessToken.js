import { RestBuilder } from '../../public/utils/rest';
import {
    setAccessTokenAction,
} from '../action-creators/auth';
import schema from '../schema';
import {
    createParamsForProjects,
    createParamsForTokenRefresh,
    urlForProjects,
    urlForTokenRefresh,
} from '../rest';
import {
    tokenSelector,
    activeUserSelector,
} from '../../common/selectors/auth';
import {
    setUserProjectsAction,
} from '../../common/action-creators/domainData';

import Locker from '../../public/utils/Locker';

export const START_TOKEN_REFRESH = 'refresh-access-token/START';
export const STOP_TOKEN_REFRESH = 'refresh-access-token/STOP';

export const startTokenRefreshAction = loadCallback => ({
    type: START_TOKEN_REFRESH,
    loadCallback,
});

export const stopTokenRefreshAction = () => ({
    type: STOP_TOKEN_REFRESH,
});

class Refresher {
    constructor(store, refreshTime) {
        this.refreshTime = refreshTime;
        this.refreshId = undefined;

        this.projectsRequest = this.createProjectsRequest(store);

        this.locker = new Locker('token-refresh-lock');
        this.locker.acquire().then(() => {
            this.refreshRequest = this.createRefreshRequest(store);
        });
    }

    createRefreshRequest = (store) => {
        const refreshRequest = new RestBuilder()
            .url(urlForTokenRefresh)
            .params(() => {
                const { refresh, access } = tokenSelector(store.getState());
                return createParamsForTokenRefresh({ refresh, access });
            })
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    store.dispatch(setAccessTokenAction(access));
                    // call itself again
                    this.schedule();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return refreshRequest;
    }

    createProjectsRequest = (store) => {
        const projectsRequest = new RestBuilder()
            .url(urlForProjects)
            .params(() => {
                const { access } = tokenSelector(store.getState());
                return createParamsForProjects({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    const { userId } = activeUserSelector(store.getState());
                    store.dispatch(setUserProjectsAction({
                        userId,
                        projects: response.results,
                    }));

                    if (this.loadCallback) {
                        this.loadCallback();
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();
        return projectsRequest;
    }

    load = (loadCallback) => {
        this.loadCallback = loadCallback;
        this.projectsRequest.start();
    }

    schedule = () => {
        if (this.refreshId) {
            console.warn('Refresh is already scheduled');
            return;
        }

        this.refreshId = setTimeout(() => {
            if (this.refreshRequest) {
                this.refreshRequest.start();
                this.refreshId = undefined;
            } else {
                this.refreshId = undefined;
                this.schedule();
            }
        }, this.refreshTime);
    }

    stop = () => {
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
    }
}

const createRefreshAccessToken = (refreshTime = 150000) => {
    const refreshAccessToken = (store) => {
        const refresher = new Refresher(store, refreshTime);
        return next => (action) => {
            // store, next, action
            switch (action.type) {
                case START_TOKEN_REFRESH:
                    refresher.load(action.loadCallback);
                    refresher.schedule();
                    break;
                case STOP_TOKEN_REFRESH:
                    refresher.stop();
                    break;
                default:
            }
            return next(action);
        };
    };
    return refreshAccessToken;
};

export default createRefreshAccessToken;
