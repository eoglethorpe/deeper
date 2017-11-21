import AbstractTask from './AbstractTask';

import { RestBuilder } from '../../public/utils/rest';
import {
    setAccessTokenAction,
} from '../action-creators/auth';
import schema from '../schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from '../rest';
import {
    tokenSelector,
} from '../../common/selectors/auth';


export default class TokenRefresher extends AbstractTask {
    constructor(store, refreshTime) {
        super();

        this.refreshTime = refreshTime;
        this.refreshId = undefined;
        this.refreshRequest = this.createRefreshRequest(store);
    }

    start() {
        this.schedule();
    }

    schedule = () => {
        if (this.refreshId) {
            console.warn('Refresh is already scheduled');
            return;
        }

        this.refreshId = setTimeout(() => {
            this.refreshRequest.start();
            this.refreshId = undefined;
        }, this.refreshTime);
    }

    stop() {
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
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
}
