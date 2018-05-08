import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    alterResponseErrorToFaramError,

    createUrlForRegion,
    createParamsForRegionPatch,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

/*
 * setState, setRegionDetails
*/
export default class RegionDetailPatchRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => (response) => {
        try {
            schema.validate(response, 'regionPatchResponse');
            const regionDetails = {
                id: response.id,
                public: response.public,
                versionId: response.versionId,
                faramValues: { ...response },
                faramErrors: {},
                pristine: false,
            };
            this.props.setRegionDetails({
                regionDetails,
                regionId,
            });
            notify.send({
                type: notify.type.SUCCESS,
                title: _ts('notification', 'regionSave'),
                message: _ts('notification', 'regionSaveSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setRegionDetailsErrors({
            faramErrors,
            regionId: this.props.regionId,
        });
    }

    fatal = () => {
        this.props.setRegionDetailsErrors({
            faramErrors: { $internal: [_ts('countries', 'regionPatchErrorText')] },
            regionId: this.props.regionId,
        });
    }

    create = (regionId, data) => {
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(createUrlForRegion(regionId))
            .params(() => createParamsForRegionPatch(data))
            .preLoad(() => { this.props.setState({ patchPending: true }); })
            .postLoad(() => { this.props.setState({ patchPending: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDetailPatchRequest;
    }
}
