import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    createUrlForGalleryFile,
    createHeaderForGalleryFile,
} from '../../../common/rest';

import { iconNames } from '../../../common/constants';

import { FgRestBuilder } from '../../../public/utils/rest';

import GalleryImage, { supportedMimeType as GalleryImageMimeType } from './components/GalleryImage';
import GalleryDocs, { supportedMimeType as GalleryDocsMimeType } from './components/GalleryDocs';

export const ComponentType = {
    IMAGE: 'image',
    DOC: 'doc',
};

export const GalleryMapping = {};
GalleryImageMimeType.forEach((type) => { GalleryMapping[type] = ComponentType.IMAGE; });
GalleryDocsMimeType.forEach((type) => { GalleryMapping[type] = ComponentType.DOC; });

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
    onlyFileName: PropTypes.bool,
    label: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
    onlyFileName: false,
    label: 'Loading file',
};

@CSSModules(styles, { allowMultiple: true })
export default class DeepGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            fileUrl: undefined,
            pending: !!props.galleryId,
            fileName: undefined,
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
                        fileUrl: response.file,
                        fileName: response.title,
                        mimeType: response.mimeType,
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

    renderPreview = ({ className, pending, fileUrl, fileName, mimeType }) => {
        if (GalleryMapping[mimeType] === ComponentType.IMAGE) {
            return (
                <GalleryImage
                    className={className}
                    imageUrl={fileUrl}
                    pending={pending}
                />
            );
        } else if (GalleryMapping[mimeType] === ComponentType.DOC) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={fileUrl}
                    pending={pending}
                    mimeType={mimeType}
                />
            );
        }
        return this.renderFileName({ fileName, fileUrl });
    }

    renderFileName = ({ fileName, fileUrl }) => (
        fileUrl ?
            <a
                styleName="gallery-file-name"
                href={fileUrl}
                target="_blank"
            >
                {fileName}
            </a>
            : <span />
    )

    render() {
        const {
            pending,
            fileUrl,
            fileName,
            mimeType,
        } = this.state;

        const {
            className,
            onlyFileName,
        } = this.props;

        if (onlyFileName) {
            if (pending) {
                return (
                    <div styleName="upload-filename">
                        <span styleName="label" >
                            {this.props.label}
                        </span>
                        <span
                            className={`${iconNames.loading} ${className}`}
                            styleName="loading-animation"
                        />
                    </div>
                );
            }
            return this.renderFileName({ fileName, fileUrl });
        }

        if (pending) {
            return (
                <div
                    styleName="pending-container"
                    className={className}
                >
                    <span
                        className={iconNames.loading}
                        styleName="loading-animation"
                    />
                </div>
            );
        }

        return this.renderPreview({ className, pending, fileUrl, fileName, mimeType });
    }
}
