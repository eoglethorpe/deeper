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
        const {
            regionDetail,
            discard,
            pristine,
            setRegionDetails,
            notificationStrings,
        } = this.props;

        try {
            schema.validate(response, 'region');
            if (response.versionId === regionDetail.versionId && !discard) {
                return;
            }
            const regionDetails = {
                formValues: { ...response },
                formErrors: {},
                formFieldErrors: {},
                pristine: false,
            };
            setRegionDetails({
                regionDetails,
                regionId,
            });
            if (pristine && !discard) {
                notify.send({
                    type: notify.type.WARNING,
                    title: notificationStrings('regionUpdate'),
                    message: notificationStrings('regionUpdateOverridden'),
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
