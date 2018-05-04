import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    urlForConnectors,
} from '../../../rest';
import _ts from '../../../ts';
import schema from '../../../schema';
import notify from '../../../notify';

const emptyList = [];

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const {
            setUserConnectors,
        } = this.props;
        try {
            schema.validate(response, 'connectors');
            const connectors = response.results || emptyList;
            const formattedConnectors = {};
            connectors.forEach((c) => {
                formattedConnectors[c.id] = {
                    id: c.id,
                    versionId: c.versionId,
                    source: c.source,
                    title: c.title,
                };
            });
            setUserConnectors({ connectors: formattedConnectors });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('notification', 'connectorTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'connectorTitle'),
            type: notify.type.ERROR,
            message: _ts('notification', 'connectorGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectors)
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
