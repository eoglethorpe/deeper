import { BgRestBuilder } from '../../../vendor/react-store/utils/rest';

import schema from '../../../schema';
import {
    createParamsForProjects,
    urlForProjects,
} from '../../../rest';

import { activeUserSelector } from '../../selectors/auth';
import { setUserProjectsAction } from '../../reducers/domainData/projects';
import { setWaitingForProjectAction } from '../../reducers/app';
import AbstractTask from '../../../utils/AbstractTask';

export default class ProjectGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createProjectsRequest = (store) => {
        const projectsRequest = new BgRestBuilder()
            .url(urlForProjects)
            .params(() => createParamsForProjects())
            .success((response) => {
                try {
                    schema.validate(response, 'projectsMiniGetResponse');
                    const { userId } = activeUserSelector(store.getState());

                    store.dispatch(setUserProjectsAction({
                        userId,
                        projects: response.results,
                        extra: response.extra,
                    }));
                    store.dispatch(setWaitingForProjectAction(false));
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: IMP logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: IMP user couldn't be verfied screen
            })
            .build();
        return projectsRequest;
    }

    start = () => {
        this.stop();

        this.projectsRequest = this.createProjectsRequest(this.store);
        this.projectsRequest.start();
    }

    stop = () => {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
    }
}
