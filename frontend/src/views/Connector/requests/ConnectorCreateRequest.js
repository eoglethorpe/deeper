import { reverseRoute } from '../../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';

import {
    createParamsForConnectorCreate,
    alterResponseErrorToFaramError,
    urlForConnectorsFull,
} from '../../../rest';
import { pathNames } from '../../../constants';
import _ts from '../../../ts';
import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorCreateRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'connector');
            const connector = {
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

            this.props.addUserConnector({ connector });

            notify.send({
                title: _ts('notification', 'connectorCreateTitle'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'connectorCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.setState({
                redirectTo: reverseRoute(
                    pathNames.connectors, { connectorId: response.id },
                ),
            });
            this.props.handleModalClose();
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setState({
            faramErrors,
            pending: false,
        });
    }

    fatal = () => {
        this.props.setState({
            faramErrors: { $internal: [_ts('connector', 'connectorCreateFailure')] },
        });
    }

    create = (newConnector) => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectorsFull)
            .params(createParamsForConnectorCreate(newConnector))
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
