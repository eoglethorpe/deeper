import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegion,
    createParamsForRegionPatch,
    transformResponseErrorToFormError,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';

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
            const regionDetails = {
                formValues: response,
                formErrors: {},
                formFieldErrors: {},
                pristine: false,
            };
            this.props.setRegionDetails({
                regionDetails,
                regionId,
                projectId: this.props.projectId,
            });
            notify.send({
                type: notify.type.SUCCESS,
                title: this.props.notificationStrings('regionSave'),
                message: this.props.notificationStrings('regionSaveSuccess'),
                duration: notify.duration.MEDIUM,
            });
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
            .preLoad(() => { this.props.setState({ regionDetailPatchPending: true }); })
            .postLoad(() => { this.props.setState({ regionDetailPatchPending: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDetailPatchRequest;
    }
}
