import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUser,
    commonParamsForGet,
} from '../../../rest';
import schema from '../../../schema';

export default class UserGetResponse {
    constructor(props) {
        this.props = props;
    }

    create = (userId) => {
        const urlForUser = createUrlForUser(userId);
        const userRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(() => commonParamsForGet())
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'userGetResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                if (response.errorCode === 404) {
                    this.props.unsetUser({ userId });
                } else {
                    console.info('FAILURE:', response);
                }
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userRequest;
    }
}
