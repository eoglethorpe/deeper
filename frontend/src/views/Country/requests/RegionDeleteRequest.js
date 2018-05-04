import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForRegion,
    createParamsForCountryDelete,
} from '../../../rest';
import notify from '../../../notify';
import _ts from '../../../ts';

/*
 * setState, unSetRegion
*/
export default class RegionDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    success = regionId => () => {
        try {
            this.props.unSetRegion({ regionId });
            notify.send({
                title: _ts('notification', 'countryDelete'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'countryDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: _ts('notification', 'countryDelete'),
            type: notify.type.ERROR,
            message: _ts('notification', 'countryDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'countryDelete'),
            type: notify.type.ERROR,
            message: _ts('notification', 'countryDeleteFatal'),
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
