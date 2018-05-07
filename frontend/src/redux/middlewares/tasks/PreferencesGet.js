import { BgRestBuilder } from '../../../vendor/react-store/utils/rest';
import { isFalsy } from '../../../vendor/react-store/utils/common';

import {
    createParamsForGet,
    urlForUserPreferences,
} from '../../../rest';
import schema from '../../../schema';
import { activeProjectIdFromStateSelector } from '../../selectors/siloDomainData/common';
import { setActiveProjectAction } from '../../reducers/siloDomainData/common';
import { setUserPreferencesAction } from '../../reducers/auth';
import { setWaitingForPreferencesAction } from '../../reducers/app';
import AbstractTask from '../../../utils/AbstractTask';

export default class PreferencesGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createPreferencesRequest = (store) => {
        const preferencesRequest = new BgRestBuilder()
            .url(urlForUserPreferences)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'userPreferences');
                    const {
                        email,
                        displayPicture,
                        isSuperuser,
                        displayName,
                        username,

                        lastActiveProject,
                    } = response;

                    const activeProjectId = activeProjectIdFromStateSelector(store.getState());
                    if (isFalsy(activeProjectId)) {
                        store.dispatch(setActiveProjectAction({
                            activeProject: lastActiveProject,
                        }));
                    }

                    store.dispatch(setUserPreferencesAction({
                        email,
                        displayPicture,
                        isSuperuser,
                        displayName,
                        username,
                    }));

                    store.dispatch(setWaitingForPreferencesAction(false));
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return preferencesRequest;
    }

    start = () => {
        this.stop();

        this.preferencesRequest = this.createPreferencesRequest(this.store);
        this.preferencesRequest.start();
    }

    stop = () => {
        if (this.preferencesRequest) {
            this.preferencesRequest.stop();
        }
    }
}
