import AbstractTask from './AbstractTask';

import { FgRestBuilder } from '../../public/utils/rest';
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

        this.store = store;
        this.refreshTime = refreshTime;
        this.refreshId = undefined;
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
            if (this.refreshRequest) {
                this.refreshRequest.stop();
            }
            this.refreshRequest = this.createRefreshRequest(this.store);
            this.refreshRequest.start();
            this.refreshId = undefined;
        }, this.refreshTime);
    }

    stop() {
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
    }

    createRefreshRequest = (store) => {
        const { refresh } = tokenSelector(store.getState());
        const refreshRequest = new FgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh({ refresh }))
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
