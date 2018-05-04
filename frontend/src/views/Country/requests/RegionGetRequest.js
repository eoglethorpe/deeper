import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegionWithField,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

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
            setRegionDetails,
        } = this.props;

        try {
            schema.validate(response, 'region');

            // FIXME: use utils.checkVersion method, don't compare version yourself
            if (response.versionId === regionDetail.versionId && !discard) {
                return;
            }
            const regionDetails = {
                formValues: response,
                formErrors: {},
                formFieldErrors: {},
                pristine: false,
                id: response.id,
                public: response.public,
                versionId: response.versionId,
            };
            setRegionDetails({
                regionDetails,
                regionId,
            });
            if (regionDetail.pristine && !discard) {
                notify.send({
                    type: notify.type.WARNING,
                    title: _ts('notification', 'regionUpdate'),
                    message: _ts('notification', 'regionUpdateOverridden'),
                    duration: notify.duration.SLOW,
                });
            }
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        // FIXME: use strings
        console.warn('FAILURE:', response);
    }

    fatal = (response) => {
        // FIXME: use strings
        console.warn('FATAL:', response);
    }

    create = (regionId) => {
        const urlForRegionForRegionalGroups = createUrlForRegionWithField(regionId);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegionForRegionalGroups)
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
