import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegionClone,
    createParamsForRegionClone,
} from '../../../rest';
import schema from '../../../schema';

export default class RegionCloneRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => (response) => {
        try {
            schema.validate(response, 'region');
            this.props.addNewRegion({
                regionDetail: response,
                projectId: this.props.projectId,
            });
            this.props.removeProjectRegion({
                projectId: this.props.projectId,
                regionId,
            });
            if (this.props.onRegionClone) {
                this.props.onRegionClone(response.id);
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

    create = (regionId, projectId) => {
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(createUrlForRegionClone(regionId))
            .params(() => createParamsForRegionClone({ project: projectId }))
            .preLoad(() => { this.props.setState({ regionClonePending: true }); })
            .postLoad(() => { this.props.setState({ regionClonePending: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDetailPatchRequest;
    }
}
