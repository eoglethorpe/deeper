import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import AccentButton from '../../../public/components/Action/Button/AccentButton';
import TextInput from '../../../public/components/Input/TextInput';
import { FgRestBuilder } from '../../../public/utils/rest';

import Screenshot from '../../components/Screenshot';

import {
    createUrlForGalleryFile,
    createHeaderForGalleryFile,
} from '../../rest';
import { commonStringsSelector } from '../../redux';
import { iconNames } from '../../constants';

import GalleryImage, { supportedMimeType as GalleryImageMimeType } from './components/GalleryImage';
import GalleryDocs, { supportedMimeType as GalleryDocsMimeType } from './components/GalleryDocs';
import styles from './styles.scss';

export ExternalGallery from './components/ExternalGallery';
export InternalGallery from './components/InternalGallery';
export GalleryViewer from './components/GalleryViewer';

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
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
    onlyFileName: false,
    label: undefined,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

@connect(mapStateToProps)
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
            screenshotMode: false,
            currentScreenshot: undefined,
        };

        if (props.galleryId) {
            this.galleryFileRequest = this.createRequestForGalleryFile(props.galleryId);
        }
    }

    componentWillMount() {
        console.warn('DeepGallery is deprecated, Please use InternalGallery component');
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
        if (this.galleryFileRequest) {
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
                    // FIXME: write schema
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

    handleScreenshot = (image) => {
        this.setState({ currentScreenshot: image });
    }

    handleScreenshotDone = () => {
        this.setState({ screenshotMode: false });
        if (this.props.onScreenshotCapture) {
            this.props.onScreenshotCapture(this.state.currentScreenshot);
        }
    }

    handleScreenshotClose = () => {
        this.setState({ screenshotMode: false });
    }

    renderScreenshotButton = () => {
        const { screenshotMode, currentScreenshot } = this.state;
        if (screenshotMode) {
            return ([
                currentScreenshot && (
                    <AccentButton
                        key="screenshot-done"
                        iconName={iconNames.check}
                        onClick={this.handleScreenshotDone}
                        transparent
                    />
                ),
                <AccentButton
                    key="screenshot-close"
                    iconName={iconNames.close}
                    onClick={this.handleScreenshotClose}
                    transparent
                />,
            ]);
        }

        return (
            <AccentButton
                iconName={iconNames.camera}
                onClick={() => { this.setState({ screenshotMode: true }); }}
                transparent
            />
        );
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
            screenshotMode,
        } = this.state;

        const {
            className,
            onlyFileName,
            showUrl,
            showScreenshot,
            label,
        } = this.props;

        if (onlyFileName) {
            if (pending) {
                return (
                    <div styleName="upload-filename">
                        <span styleName="label" >
                            { label || this.props.commonStrings('loadingFileLabel') }
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

        const classNames = [
            className,
            'deep-gallery',
            styles['deep-gallery'],
        ];

        if (showUrl) {
            classNames.push(styles['urlbar-shown']);
        }

        return (
            <div className={classNames.join(' ')}>
                {
                    showUrl &&
                        <div styleName="urlbar">
                            <TextInput
                                styleName="url"
                                value={fileUrl}
                                readOnly
                                showLabel={false}
                                showHintAndError={false}
                                selectOnFocus
                            />
                            <div styleName="action-buttons">
                                <a
                                    styleName="open-link"
                                    href={fileUrl}
                                    target="_blank"
                                >
                                    <span className={iconNames.openLink} />
                                </a>
                                { showScreenshot && this.renderScreenshotButton() }
                            </div>
                        </div>
                }
                <div
                    styleName="doc-container"
                    className="doc-container"
                >
                    { screenshotMode && (
                        <Screenshot
                            onCapture={this.handleScreenshot}
                        />
                    ) }
                    { this.renderPreview({
                        className: styles.doc,
                        pending,
                        fileUrl,
                        fileName,
                        mimeType,
                    }) }
                </div>
            </div>
        );
    }
}
