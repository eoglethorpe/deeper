import { BgRestBuilder } from '../../../vendor/react-store/utils/rest';

import schema from '../../../schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from '../../../rest';

import { tokenSelector } from '../../selectors/auth';
import { setAccessTokenAction } from '../../reducers/auth';
import AbstractTask from '../../../utils/AbstractTask';

const REFRESH_TIME = 1000 * 60 * 10;
const REFRESH_CHECK_TIME = 1000;

export default class TokenRefresher extends AbstractTask {
    constructor(store, refreshTime = REFRESH_TIME, refreshCheckTime = REFRESH_CHECK_TIME) {
        super();

        this.store = store;
        this.refreshTime = refreshTime;
        this.refreshCheckTime = refreshCheckTime;

        this.refreshId = undefined;
        // NOTE: set lastRefreshTime to currentTime
        // NOTE: Token has been refreshed once before scheduling refresh
        this.lastRefreshTime = (new Date()).getTime();
    }

    createRefreshRequest = (store) => {
        const { refresh } = tokenSelector(store.getState());
        const refreshRequest = new BgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh({ refresh }))
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    store.dispatch(setAccessTokenAction(access));

                    // call itself again
                    this.scheduleRefreshCheck();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // NOTE: this will probably never be called
                // because BgRestBuilder will never stop retrying
                this.scheduleRefreshCheck();
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // NOTE: this will probably never be called
                // because BgRestBuilder will never stop retrying
                this.scheduleRefreshCheck();
            })
            .build();
        return refreshRequest;
    }

    refreshAction = () => {
        this.refreshId = undefined;

        const now = (new Date()).getTime();
        const difference = now - this.lastRefreshTime;
        // NOTE: difference can be zero if system time has changed
        if (difference < 0 || difference > this.refreshTime) {
            // console.log('Refreshing now', difference);
            this.lastRefreshTime = now;
        } else {
            // console.log('You shall not pass', difference);
            this.scheduleRefreshCheck();
            // You shall not pass
            return;
        }

        if (this.refreshRequest) {
            this.refreshRequest.stop();
        }
        this.refreshRequest = this.createRefreshRequest(this.store);
        this.refreshRequest.start();
    }

    scheduleRefreshCheck = () => {
        // console.log('Scheduling refresh check');
        if (this.refreshId) {
            console.warn('Refresh is already scheduled. Not re-scheduled.');
            return;
        }
        this.refreshId = setTimeout(this.refreshAction, this.refreshCheckTime);
    }

    clearRefreshCheck = () => {
        // console.log('Clearing refresh check');
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
    }

    start() {
        // console.warn('Refresh schedule started');
        this.scheduleRefreshCheck();
    }

    stop() {
        this.clearRefreshCheck();
    }
}
