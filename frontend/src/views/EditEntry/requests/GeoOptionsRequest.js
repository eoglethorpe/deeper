import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForGeoOptions,
    createParamsForGeoOptionsGET,

    transformResponseErrorToFormError,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';

export default class GeoOptionsRequest {
    constructor(params) {
        const {
            setState,
            entryStrings,
            setGeoOptions,
        } = params;
        this.setState = setState;
        this.entryStrings = entryStrings;
        this.setGeoOptions = setGeoOptions;
    }

    create = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(() => createParamsForGeoOptionsGET())
            .preLoad(() => this.setState({ pendingGeo: true }))
            .delay(0)
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                    this.setState({ pendingGeo: false });
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
                    title: this.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ pendingGeo: false });
            })
            .fatal(() => {
                notify.send({
                    title: this.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: this.entryStrings('geoOptionsFatalMessage'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ pendingGeo: false });
            })
            .build();
        return geoOptionsRequest;
    }
}
