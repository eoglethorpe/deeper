import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    createUrlForGalleryFile,
    createHeaderForGalleryFile,
} from '../../../common/rest';

import {
    FgRestBuilder,
} from '../../../public/utils/rest';

import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
};

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
        if (this.props.galleryId !== nextProps.galleryId) {
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
        const galleryFileRequest = new FgRestBuilder()
            .url(createUrlForGalleryFile(galleryId))
            .params(createHeaderForGalleryFile())
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
