import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';

import {
    tokenSelector,
} from '../../../common/redux';

import {
    createUrlForGalleryFile,
    createHeaderForGalleryFile,
} from '../../../common/rest';

import {
    RestBuilder,
} from '../../../public/utils/rest';

import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    className: '',
    galleryId: undefined,
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
});


@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class GalleryImage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            imageUrl: undefined,
            pending: !!props.galleryId,
        };

        if (props.galleryId) {
            this.galleryFileRequest = this.createRequestForGalleryFile(props.galleryId);
        }
    }

    componentWillMount() {
        if (this.galleryFileRequest) {
            this.galleryFileRequest.start();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.galleryId) {
            if (this.galleryFileRequest) {
                this.galleryFileRequest.stop();
            }

            this.galleryFileRequest = this.createRequestForGalleryFile(nextProps.galleryId);
            this.galleryFileRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.galleryFilterRequest) {
            this.galleryFileRequest.stop();
        }
    }

    createRequestForGalleryFile = (galleryId) => {
        const galleryFileRequest = new RestBuilder()
            .url(createUrlForGalleryFile(galleryId))
            .params(() => {
                const {
                    token,
                } = this.props;

                return createHeaderForGalleryFile(token);
            })
            .preLoad(() => {
                this.setState({
                    pending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pending: false,
                });
            })
            .success((response) => {
                try {
                    // TODO: validate schema
                    this.setState({
                        imageUrl: response.file,
                        pending: false,
                    });
                } catch (err) {
                    console.error(err);
                    this.setState({
                        pending: false,
                    });
                }
            })
            .failure((response) => {
                console.error('Failed to get gallery image', response);
                this.setState({
                    pending: false,
                });
            })
            .fatal((response) => {
                console.error('Fatal error occured while getting gallery image', response);
                this.setState({
                    pending: false,
                });
            })
            .retryTime(1000)
            .maxRetryAttempts(10)
            .build();

        return galleryFileRequest;
    }

    render() {
        const {
            pending,
            imageUrl,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <div
                styleName="gallery-image"
                className={`gallery-image ${className}`}
            >
                {
                    pending && (
                        <LoadingAnimation />
                    )
                }
                {
                    imageUrl ? (
                        <img
                            alt="user"
                            className="image"
                            styleName="image"
                            src={imageUrl}
                        />
                    ) : (
                        <span
                            styleName="image-alt"
                            className="image-alt ion-android-contact"
                        />
                    )
                }
            </div>
        );
    }
}
