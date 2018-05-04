import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroup,
    createParamsForUserGroupsPatch,
    alterResponseErrorToFaramError,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';
import _ts from '../../../ts';

/*
 * props: setState, setUserGroup, handleModalClose
*/
export default class UserGroupPatchRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'userGroupCreateResponse');
            this.props.setUserGroup({
                userGroup: response,
            });
            notify.send({
                title: _ts('notification', 'userGroupEdit'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'userGroupEditSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.handleModalClose();
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setState({ faramErrors });
    }

    fatal = () => {
        this.props.setState({
            faramErrors: { $internal: [_ts('user', 'userGroupPatchFatal')] },
        });
    }

    create = (userGroupId, { title, description }) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userGroupCreateRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsPatch({ title, description }))
            .preLoad(() => {
                this.props.setState({ pending: true });
            })
            .postLoad(() => {
                this.props.setState({ pending: false });
            })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return userGroupCreateRequest;
    }
}
