import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import schema from '../../../schema';
import {
    createUrlForAryFilterOptions,
    commonParamsForGET,
} from '../../../rest';

export default class AryFilterOptionsGetRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAryFilterOptions } = params;
        this.setAryFilterOptions = setAryFilterOptions;
    }

    create = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForAryFilterOptions(activeProject);

        const aryFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => commonParamsForGET())
            .preLoad(() => {
                // FIXME: use this
                this.setState({ loadingAryFilters: true });
            })
            .postLoad(() => {
                // FIXME: use this
                this.setState({ loadingAryFilters: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'aryEntryFilterOptionsResponse');
                    this.setAryFilterOptions({
                        projectId: activeProject,
                        aryFilterOptions: response,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .build();

        return aryFilterOptionsRequest;
    }
}
