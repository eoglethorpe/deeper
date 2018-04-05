import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegionWithField,
    createParamsForUser,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

/*
 * setState, setRegionDetails
*/

export default class RegionGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => (response) => {
        try {
            schema.validate(response, 'region');
            if (response.versionId === this.props.regionDetail.versionId) {
                return;
            }
            const regionDetails = {
                formValues: { ...response },
                formErrors: {},
                formFieldErrors: {},
                pristine: false,
            };
            this.props.setRegionDetails({
                regionDetails,
                regionId,
            });
            if (this.props.pristine) {
                notify.send({
                    type: notify.type.WARNING,
                    title: this.props.notificationStrings('regionUpdate'),
                    message: this.props.notificationStrings('regionUpdateOverridden'),
                    duration: notify.duration.SLOW,
                });
            }
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn('FAILURE:', response);
    }

    fatal = (response) => {
        console.warn('FATAL:', response);
    }

    create = (regionId) => {
        const urlForRegion = createUrlForRegionWithField(regionId);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegion)
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionRequest;
    }
}
