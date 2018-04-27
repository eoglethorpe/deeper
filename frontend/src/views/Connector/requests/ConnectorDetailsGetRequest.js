import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForConnector,
} from '../../../rest';
import { checkVersion } from '../../../vendor/react-store/utils/common';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorDetailsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const {
            setUserConnectorDetails,
            connectorDetails,
            notificationStrings,
            isBeingCancelled,
        } = this.props;
        try {
            schema.validate(response, 'connector');
            const isVersionSame = checkVersion(response.versionId, connectorDetails.versionId);
            if (isVersionSame && !isBeingCancelled) {
                return;
            }
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
            if (connectorDetails.pristine && !isBeingCancelled) {
                notify.send({
                    type: notify.type.WARNING,
                    title: notificationStrings('connectorTitle'),
                    message: notificationStrings('connectorUpdateOverriden'),
                    duration: notify.duration.SLOW,
                });
            }
            this.props.setState({
                requestFailure: false,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        // FIXME: Handle error during isBeingCanelled
        notify.send({
            title: this.props.notificationStrings('connectorTitle'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('connectorGetFailure'),
            duration: notify.duration.MEDIUM,
        });
        this.props.setState({
            requestFailure: true,
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
