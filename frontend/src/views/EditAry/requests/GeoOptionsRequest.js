import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForGeoOptions,
    createParamsForGeoOptionsGET,
    transformResponseErrorToFormError,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

export default class GeoOptionsRequest {
    constructor(params) {
        const { setState, setGeoOptions } = params;
        this.setState = setState;
        this.setGeoOptions = setGeoOptions;
    }

    create = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(() => createParamsForGeoOptionsGET())
            .preLoad(() => this.setState({ pendingGeo: true }))
            .postLoad(() => this.setState({ pendingGeo: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('entry', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('entry', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: _ts('entry', 'geoOptionsFatalMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    }
}
