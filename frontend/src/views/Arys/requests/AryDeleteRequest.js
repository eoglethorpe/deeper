import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    createUrlForAryDelete,
    createParamsForAryDelete,
    transformResponseErrorToFormError,
} from '../../../rest';

export default class AryDeleteRequest {
    constructor(params) {
        const {
            pullArys,
            setState,
        } = params;
        this.pullArys = pullArys;
        this.setState = setState;
    }

    create = (ary) => {
        const { id } = ary;
        const arysRequest = new FgRestBuilder()
            .url(createUrlForAryDelete(id))
            .params(() => createParamsForAryDelete())
            .preLoad(() => {
                this.setState({ loadingArys: true });
            })
            .success(() => {
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.SUCCESS,
                    message: 'Ary Delete Success', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
                this.pullArys();
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Arys', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Ary Delete Failure', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return arysRequest;
    }
}
