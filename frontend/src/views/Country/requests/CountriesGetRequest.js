import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForRegions,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

/*
 * setRegions
*/
export default class CountriesGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'regionsGetResponse');
            this.props.setRegions({
                regions: response.results,
            });
        } catch (er) {
            console.error(er, response);
        }
    }

    failure = (response) => {
        console.warn('FAILURE:', response);
    }

    fatal = (response) => {
        console.warn('FATAL:', response);
    }

    create = () => {
        const countriesRequest = new FgRestBuilder()
            .url(urlForRegions)
            .params(createParamsForUser)
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return countriesRequest;
    }
}
