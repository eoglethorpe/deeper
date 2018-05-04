import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import { checkVersion } from '../../../vendor/react-store/utils/common';
import {
    createParamsForUser,
    createUrlForConnector,
} from '../../../rest';
import _ts from '../../../ts';
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
            isBeingCancelled,
        } = this.props;

        try {
            schema.validate(response, 'connector');
            this.props.setState({ requestFailure: false });

            const {
                shouldSetValue,
                isValueOverriden,
            } = checkVersion(connectorDetails.versionId, response.versionId);

            if (!shouldSetValue && !isBeingCancelled) {
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


            if (isValueOverriden && !isBeingCancelled) {
                notify.send({
                    type: notify.type.WARNING,
                    title: _ts('notification', 'connectorTitle'),
                    message: _ts('notification', 'connectorUpdateOverriden'),
                    duration: notify.duration.SLOW,
                });
            }
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        // FIXME: Handle error during isBeingCanelled
        notify.send({
            title: _ts('notification', 'connectorTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
        this.props.setState({ requestFailure: true });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'connectorTitle'),
            type: notify.type.ERROR,
            message: _ts('notification', 'connectorGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (connectorId) => {
        const connectorDetailsRequest = new FgRestBuilder()
            .url(createUrlForConnector(connectorId))
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ connectorDataLoading: true }); })
            .postLoad(() => { this.props.setState({ connectorDataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorDetailsRequest;
    }
}
