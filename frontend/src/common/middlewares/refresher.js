import { FgRestBuilder } from '../../public/utils/rest';
import schema from '../schema';
import {
    createParamsForProjects,
    urlForProjects,
} from '../rest';
import {
    activeUserSelector,
} from '../../common/selectors/auth';
import {
    setUserProjectsAction,
} from '../../common/action-creators/domainData';


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
        this.stop();
        this.loadCallback = loadCallback;
        this.projectsRequest = this.createProjectsRequest(this.store);
        this.projectsRequest.start();
    }

    stop = () => {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
    }
}

const refresherMiddleware = (store) => {
    const refresher = new Refresher(store);
    return next => (action) => {
        // store, next, action
        switch (action.type) {
            case START_REFRESH:
                refresher.load(action.loadCallback);
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
