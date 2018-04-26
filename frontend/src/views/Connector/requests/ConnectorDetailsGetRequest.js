import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForConnector,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorDetailsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const {
            setUserConnectorDetails,
        } = this.props;
        try {
            schema.validate(response, 'connector');
            const formattedConnector = {
                id: response.id,
                versionId: response.versionId,
                source: response.source,
                faramValues: {
                    title: response.title,
                    params: response.params,
                    users: response.users,
                    projects: response.projects,
                },
                faramErrors: {},
                prisitne: false,
            };
            setUserConnectorDetails({
                connectorDetails: formattedConnector,
                connectorId: formattedConnector.id,
            });
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

    create = (connectorId) => {
        const connectorDetailsRequest = new FgRestBuilder()
            .url(createUrlForConnector(connectorId))
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorDetailsRequest;
    }
}
