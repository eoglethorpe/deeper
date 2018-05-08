import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import { randomString } from '../../../vendor/react-store/utils/common';
import {
    createParamsForGet,
    createUrlForConnectorleads,
} from '../../../rest';
import _ts from '../../../ts';
import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorLeadsRequest {
    constructor(props) {
        this.props = props;
    }

    success = connectorId => (response) => {
        try {
            schema.validate(response, 'connectorLeads');
            const connectorLeads = [];
            response.results.forEach((l) => {
                const lead = l;
                lead.key = randomString(16).toLowerCase();
                lead.isSelected = false;
                connectorLeads.push(lead);
            });
            this.props.setConnectorLeads({
                connectorLeads,
                connectorId,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('notification', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'connectorSourcesTitle'),
            type: notify.type.ERROR,
            message: _ts('notification', 'connectorSourcesGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (connectorId) => {
        const connectorLeadsRequest = new FgRestBuilder()
            .url(createUrlForConnectorleads(connectorId))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ connectorLeadsLoading: true }); })
            .postLoad(() => { this.props.setState({ connectorLeadsLoading: false }); })
            .success(this.success(connectorId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorLeadsRequest;
    }
}
