import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForLeadGroups,
    createParamsForLeadGroupCreate,
    alterResponseErrorToFaramError,
} from '../../../rest';
import _ts from '../../../ts';

import schema from '../../../schema';
import notify from '../../../notify';

export default class LeadGroupsCreateRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'leadGroup');
            const newLeadGroup = {
                key: response.id,
                value: response.title,
            };
            const projectId = response.project;

            this.props.addLeadGroup({
                projectId,
                newLeadGroup,
            });
            this.props.handleModalClose();
            notify.send({
                title: _ts('notification', 'leadGroupTitle'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'leadGroupCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
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
            faramErrors: { $internal: [_ts('addLeads', 'leadGroupCreateFailure')] },
        });
    }


    create = (newLeadGroup) => {
        const leadGroupCreateRequest = new FgRestBuilder()
            .url(urlForLeadGroups)
            .params(createParamsForLeadGroupCreate(newLeadGroup))
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return leadGroupCreateRequest;
    }
}
