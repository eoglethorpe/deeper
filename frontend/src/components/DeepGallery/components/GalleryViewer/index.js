import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import AccentButton from '../../../../vendor/react-store/components/Action/Button/AccentButton';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import urlRegex from '../../../../vendor/react-store/components/Input/Form/regexForWeburl';

import { iconNames } from '../../../../constants';
import {
    commonStringsSelector,
    leadsStringsSelector,
} from '../../../../redux';
import { galleryMapping, galleryType } from '../../../../config/deepMimeTypes';

import notify from '../../../../notify';

import Screenshot from '../../../Screenshot';
import GalleryImage from '../GalleryImage';
import GalleryDocs from '../GalleryDocs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,

    invalidUrlMessage: PropTypes.string,
    cannotPreviewUrlMessage: PropTypes.string,

    leadsStrings: PropTypes.func.isRequired,
    // commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    url: '',
    mimeType: '',
    canShowIframe: false,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,

    invalidUrlMessage: undefined,
    cannotPreviewUrlMessage: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
    leadsStrings: leadsStringsSelector(state),
});


/*
 * Document [pdf, image, docx, html] viewer handler
 * Use required document viewer according to the mime-type
*/
@connect(mapStateToProps)
export default class GalleryViewer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isUrlValid = url => (url && urlRegex.test(url))

    constructor(props) {
        super(props);

        this.state = {
            screenshotMode: false,
        };
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

    handleScreenshotError = (message) => {
        notify.send({
            title: 'Screenshot', // FIXME: strings
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
        this.setState({ screenshotMode: false });
    }

    renderHTML = ({ className, url }) => (
        <iframe
            className={className}
            sandbox="allow-scripts allow-same-origin"
            title={url}
            src={url}
        />
    )

    renderErrorScreen = (url) => {
        const { invalidUrlMessage, cannotPreviewUrlMessage, leadsStrings } = this.props;
        return (
            <div className={styles.errorUrl}>
                {
                    GalleryViewer.isUrlValid(url) ?
                        <span className={styles.msg}>
                            {cannotPreviewUrlMessage || leadsStrings('cannotPreviewUrl')}
                        </span>
                        :
                        <span className={styles.msg}>
                            {invalidUrlMessage || leadsStrings('invalidUrl')}
                        </span>
                }
            </div>
        );
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

    renderBar = ({ url, showScreenshot }) => {
        const isScreenshotable = showScreenshot;
        const urlbarClassNames = [
            styles.urlbar,
            'urlbar',
        ];
        return (
            <div className={urlbarClassNames.join(' ')}>
                <TextInput
                    className={styles.url}
                    value={url || ''}
                    readOnly
                    showLabel={false}
                    showHintAndError={false}
                    selectOnFocus
                />
                {
                    <div className={styles.actionButtons}>
                        <a
                            className={styles.openLink}
                            href={url}
                            target="_blank"
                        >
                            <span className={iconNames.openLink} />
                        </a>
                        { isScreenshotable && this.renderScreenshotButton() }
                    </div>
                }
            </div>
        );
    }

    renderPreview = ({ className, url, mimeType, canShowIframe, previewError, isHttps }) => {
        if (isHttps && galleryMapping[mimeType] === galleryType.IMAGE) {
            return (
                <GalleryImage
                    className={className}
                    imageUrl={url}
                    canShowIframe={canShowIframe}
                />
            );
        } else if (galleryMapping[mimeType] === galleryType.DOC) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={url}
                    mimeType={mimeType}
                    canShowIframe={canShowIframe}
                    notHttps={!isHttps}
                />
            );
        } else if (!previewError && galleryMapping[mimeType] === galleryType.HTML) {
            // NOTE: Error can occur if
            // 1. We cannot show iframe
            // 2. If there is no alternative https url and current url is http
            return this.renderHTML({ className, url });
        }
        return this.renderErrorScreen(url);
    }

    render() {
        const {
            className,
            url,
            mimeType,
            canShowIframe,
            showUrl,
            showScreenshot,
        } = this.props;
        const { screenshotMode } = this.state;

        const containerStyles = [styles.galleryViewer];
        const isHttps = !!(url || '').match(/^https:\/\//) || window.location.protocol === 'http:';
        const previewError = !canShowIframe || !isHttps;
        const showBar = showUrl || showScreenshot;

        if (showBar) {
            containerStyles.push(styles.urlbarShown);
        }

        const docContainerClassNames = [
            styles.docContainer,
            'doc-container',
        ];

        return (
            <div className={`${containerStyles.join(' ')} ${className}`}>
                {
                    showBar &&
                    this.renderBar({
                        url,
                        showUrl,
                        showBar,
                        showScreenshot,
                    })
                }
                <div className={docContainerClassNames.join(' ')}>
                    { screenshotMode && (
                        <Screenshot
                            onCapture={this.handleScreenshot}
                            onCaptureError={this.handleScreenshotError}
                            onCancel={this.handleScreenshotClose}
                        />
                    )}
                    {
                        this.renderPreview({
                            className: styles.doc,
                            url,
                            mimeType,
                            canShowIframe,
                            previewError,
                            isHttps,
                        })
                    }
                </div>
            </div>
        );
    }
}
