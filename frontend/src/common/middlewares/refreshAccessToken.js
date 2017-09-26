import { RestBuilder } from '../../public/utils/rest';
import { setAccessTokenAction } from '../action-creators/auth';
import schema from '../schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from '../rest';

export const START_TOKEN_REFRESH = 'refresh-access-token/START';
export const STOP_TOKEN_REFRESH = 'refresh-access-token/STOP';

export const startTokenRefreshAction = () => ({
    type: START_TOKEN_REFRESH,
});

export const stopTokenRefreshAction = () => ({
    type: STOP_TOKEN_REFRESH,
});

class Helper {
    constructor(store, refreshTime) {
        this.refreshTime = refreshTime;
        const url = urlForTokenRefresh;
        const paramsFn = () => {
            const { refresh } = store.getState().auth;
            return createParamsForTokenRefresh({ refresh });
        };
        this.refreshRequest = new RestBuilder()
            .url(url)
            .params(paramsFn)
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

        this.refreshId = undefined;
    }

    schedule = () => {
        if (this.refreshId) {
            console.warn('Refresh is already scheduled');
        }
        this.refreshId = setTimeout(() => {
            this.refreshRequest.start();
            this.refreshId = undefined;
        }, this.refreshTime);
    }

    stop = () => {
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
    }
}

const createRefreshAccessToken = (refreshTime = 5000) => {
    const refreshAccessToken = (store) => {
        const helper = new Helper(store, refreshTime);
        return next => (action) => {
            // store, next, action
            switch (action.type) {
                case START_TOKEN_REFRESH:
                    helper.schedule();
                    break;
                case STOP_TOKEN_REFRESH:
                    helper.stop();
                    break;
                default:
            }
            return next(action);
        };
    };
    return refreshAccessToken;
};

export default createRefreshAccessToken;
