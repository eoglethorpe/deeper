import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserPatch,
    createParamsForUserPatch,
    alterResponseErrorToFaramError,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';
import _ts from '../../../ts';

export default class UserPatchRequest {
    constructor(props) {
        this.props = props;
    }

    create = (userId, { firstName, lastName, organization, displayPicture }) => {
        const urlForUser = createUrlForUserPatch(userId);
        const userPatchRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(
                () => createParamsForUserPatch({
                    firstName, lastName, organization, displayPicture,
                }),
            )
            .preLoad(() => {
                this.props.setState({ pending: true });
            })
            .postLoad(() => {
                this.props.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPatchResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                    notify.send({
                        title: _ts('notification', 'userProfileEdit'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'userEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: _ts('notification', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userEditFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.props.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userEditFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.props.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to save user.'] },
                });
            })
            .build();
        return userPatchRequest;
    }
}
