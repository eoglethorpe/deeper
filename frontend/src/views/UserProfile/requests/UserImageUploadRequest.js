import { UploadBuilder } from '../../../vendor/react-store/utils/upload';
import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../../rest';
import notify from '../../../notify';
import _ts from '../../../ts';

export default class UserImageUploadRequest {
    constructor(props) {
        this.props = props;
    }

    create = (file) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload({ is_public: true }))
            .preLoad(() => {
                this.props.setState({ pending: true });
            })
            .postLoad(() => {
                this.props.setState({ pending: false });
            })
            .success((response) => {
                this.props.handleImageUploadSuccess(response.id);
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('notification', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userEditImageUploadFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: _ts('notification', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userEditImageUploadFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .progress((progress) => {
                console.warn(progress);
            })
            .build();
        return uploader;
    }
}
