import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegion,
    createParamsForRegionPatch,
    transformResponseErrorToFormError,
} from '../../../rest';
import schema from '../../../schema';

/*
 * setState, setRegionDetails, countriesStrings
*/
export default class RegionDetailPatchRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => (response) => {
        try {
            schema.validate(response, 'regionPatchResponse');
            this.props.setRegionDetails({
                regionDetails: response,
                regionId,
            });
            this.props.setState({ pristine: false });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);
        this.props.setState({
            formFieldErrors,
            formErrors,
            pending: false,
        });
    }

    fatal = () => {
        this.props.setState({
            formErrors: { errors: [this.props.countriesStrings('regionPatchErrorText')] },
            pending: false,
        });
    }

    create = (regionId, data) => {
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(createUrlForRegion(regionId))
            .params(() => createParamsForRegionPatch(data))
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDetailPatchRequest;
    }
}
