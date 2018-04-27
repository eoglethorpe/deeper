import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    alterResponseErrorToFaramError,

    createParamsForConnectorPatch,
    createUrlForConnector,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorPatchRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const { setUserConnectorDetails } = this.props;
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
                pristine: false,
            };
            setUserConnectorDetails({
                connectorDetails: formattedConnector,
                connectorId: formattedConnector.id,
            });
            notify.send({
                title: this.props.notificationStrings('connectorTitle'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('connectorPatchSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setConnectorError({
            faramErrors,
            connectorId: this.props.connectorId,
        });
    }

    fatal = () => {
        this.props.setConnectorError({
            faramErrors: { $internal: [this.props.connectorStrings('connectorPatchFailure')] },
            connectorId: this.props.connectorId,
        });
    }

    create = (connectorId, connectorDetails) => {
        const connectorPatchRequest = new FgRestBuilder()
            .url(createUrlForConnector(connectorId))
            .params(createParamsForConnectorPatch(connectorDetails))
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorPatchRequest;
    }
}
