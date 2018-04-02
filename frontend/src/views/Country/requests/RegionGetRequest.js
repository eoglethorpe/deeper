import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegionWithField,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

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
            this.props.setRegionDetails({
                regionDetails: response,
                regionId,
            });
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
        const urlForRegionForRegionalGroups = createUrlForRegionWithField(regionId, ['regional_groups']);

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
