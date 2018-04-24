import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    urlForConnectorSources,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'connectorSources');
            this.props.setConnectorSources({ connectorSources: response.results });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('connectorSourcesGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = () => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectorSources)
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
