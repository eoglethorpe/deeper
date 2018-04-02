import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegion,
    createParamsForCountryDelete,
} from '../../../rest';
import notify from '../../../notify';

/*
 * setState, unSetRegion, notificationStrings
*/
export default class RegionDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => () => {
        // FIXME: write schema
        try {
            this.props.unSetRegion({ regionId });
            notify.send({
                title: this.props.notificationStrings('countryDelete'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('countryDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('countryDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('countryDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: this.props.notificationStrings('countryDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('countryDeleteFatal'),
            duration: notify.duration.SLOW,
        });
    }

    create = (regionId) => {
        const urlForRegionDelete = createUrlForRegion(regionId);
        const regionDeleteRequest = new FgRestBuilder()
            .url(urlForRegionDelete)
            .params(createParamsForCountryDelete)
            .preLoad(() => { this.props.setState({ deletePending: true }); })
            .postLoad(() => { this.props.setState({ deletePending: false }); })
            .success(this.success(regionId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return regionDeleteRequest;
    }
}
