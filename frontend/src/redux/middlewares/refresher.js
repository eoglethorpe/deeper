import { FgRestBuilder } from '../../vendor/react-store/utils/rest';

import { setGaUserId } from '../../config/google-analytics';
import schema from '../../schema';
import {
    createParamsForProjects,
    urlForProjects,
} from '../../rest';

import { activeUserSelector } from '../selectors/auth';
import { setUserProjectsAction } from '../reducers/domainData/projects';


export const START_REFRESH = 'refresh/START';
export const STOP_REFRESH = 'refresh/STOP';

export const startRefreshAction = loadCallback => ({
    type: START_REFRESH,
    loadCallback,
});

export const stopRefreshAction = () => ({
    type: STOP_REFRESH,
});


class Refresher {
    constructor(store) {
        this.store = store;
    }

    createProjectsRequest = (store) => {
        const projectsRequest = new FgRestBuilder()
            .url(urlForProjects)
            .params(() => createParamsForProjects())
            .success((response) => {
                try {
                    schema.validate(response, 'projectsMiniGetResponse');
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
                // TODO: notify
                // logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: notify
                // user couldn't be verfied screen
            })
            .build();
        return projectsRequest;
    }

    start = (loadCallback) => {
        this.stop();
        this.loadCallback = loadCallback;
        this.projectsRequest = this.createProjectsRequest(this.store);
        this.projectsRequest.start();

        const { userId } = activeUserSelector(this.store.getState());
        setGaUserId(userId);
    }

    stop = () => {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
        setGaUserId(undefined);
    }
}

const refresherMiddleware = (store) => {
    const refresher = new Refresher(store);
    return next => (action) => {
        // store, next, action
        switch (action.type) {
            case START_REFRESH:
                refresher.start(action.loadCallback);
                break;
            case STOP_REFRESH:
                refresher.stop();
                break;
            default:
        }
        return next(action);
    };
};

export default refresherMiddleware;
