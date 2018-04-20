import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    urlForConnectors,
} from '../../../rest';

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            console.warn(response);
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn('failure:', response);
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = () => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectors)
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
