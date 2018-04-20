import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    urlForConnectors,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

const emptyList = [];

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const {
            setUserConnectors,
        } = this.props;
        try {
            schema.validate(response, 'connectors');
            const connectors = response.results || emptyList;
            const formattedConnectors = {};
            connectors.forEach((c) => {
                formattedConnectors[c.id] = {
                    id: c.id,
                    versionId: c.versionId,
                    formValues: { ...c },
                    formErrors: {},
                    formFieldErrors: {},
                    prisitne: false,
                };
            });
            setUserConnectors({ connectors: formattedConnectors });
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
