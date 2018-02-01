import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    iconNames,
    leadsString,
} from '../../../common/constants';

import GalleryDocs from '../../../common/components/DeepGallery/components/GalleryDocs';
import { GalleryMapping, ComponentType } from '../../../common/components/DeepGallery';

import Screenshot from '../../../common/components/Screenshot';

import { AccentButton } from '../../../public/components/Action';
import { TextInput } from '../../../public/components/Input';
import { FgRestBuilder } from '../../../public/utils/rest';
import {
    urlForWebsiteFetch,
    createParamsForWebsiteFetch,
} from '../../../../src/common/rest';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,
};

const defaultProps = {
    className: '',
    url: undefined,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class WebsiteViewer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.initialState = {
            pending: true,
            canShowIframe: false,
            mimeType: undefined,
            isDoc: undefined,
            httpsUrl: undefined,
            invalidUrl: undefined,
            screenshotMode: false,
            currentScreenshot: undefined,
        };

        this.state = { ...this.initialState };

        if (props.url) {
            this.urlRequest = this.createRequestForUrl(props.url);
        }
    }

    componentWillMount() {
        if (this.urlRequest) {
            this.urlRequest.start();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.url !== nextProps.url) {
            if (this.urlRequest) {
                this.urlRequest.stop();
            }

            this.urlRequest = this.createRequestForUrl(nextProps.url);
            this.urlRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.urlRequest) {
            this.urlRequest.stop();
        }
    }

    createRequestForUrl = (url) => {
        const urlRequest = new FgRestBuilder()
            .url(urlForWebsiteFetch)
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .params(() => createParamsForWebsiteFetch(url))
            .success((response) => {
                try {
                    // FIXME: write schema
                    const mimeType = response.headers['Content-Type'];
                    const isDoc = GalleryMapping[mimeType] === ComponentType.DOC;

                    const httpsUrl = response.httpsUrl;
                    const xFrameOptions = response.headers['X-Frame-Options'];
                    const contentSecurityPolicy = response.headers['Content-Security-Policy'];
                    let canShowIframe = true;

                    // Older policy
                    if (xFrameOptions) {
                        const options = xFrameOptions.toLowerCase();
                        // TODO: allow-from check if deep url is allowed
                        if (options.match('sameorigin|deny|allow-from')) {
                            canShowIframe = false;
                        }
                    }

                    // New policy
                    if (canShowIframe && contentSecurityPolicy) {
                        const options = contentSecurityPolicy.toLowerCase();
                        // TODO: uri check if deep url is allowed
                        if (options.match('frame-ancestors')) {
                            canShowIframe = false;
                        }
                    }

                    this.setState({
                        canShowIframe,
                        mimeType,
                        isDoc,
                        httpsUrl,
                        invalidUrl: false,
                    });
                } catch (err) {
                    this.setState({ ...this.initialState });
                }
            })
            .failure((response) => {
                // server can't fetch the url
                console.error('Failure: ', response);
                this.setState({ ...this.initialState, invalidUrl: true });
            })
            .fatal((response) => {
                // server can't fetch the url
                console.error('Fatal: ', response);
                this.setState({ ...this.initialState });
            })
            .build();

        return urlRequest;
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

    renderIFrame = () => {
        const {
            className,
            showUrl,
            showScreenshot,
            url,
        } = this.props;
        const { httpsUrl, screenshotMode } = this.state;

        const docContainerClassNames = [
            styles['doc-container'],
            'doc-container',
        ];

        const classNames = [
            className,
            'website-viewer',
            styles['website-viewer'],
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
                                value={httpsUrl || url}
                                readOnly
                                showLabel={false}
                                showHintAndError={false}
                                selectOnFocus
                            />
                            <div styleName="action-buttons">
                                <a
                                    styleName="open-link"
                                    href={httpsUrl || url}
                                    target="_blank"
                                >
                                    <span className={iconNames.openLink} />
                                </a>
                                { showScreenshot && this.renderScreenshotButton() }
                            </div>
                        </div>
                }
                <div className={docContainerClassNames.join(' ')}>
                    { screenshotMode && (
                        <Screenshot
                            onCapture={this.handleScreenshot}
                        />
                    ) }
                    <iframe
                        styleName="doc"
                        sandbox="allow-scripts allow-same-origin"
                        title={httpsUrl}
                        src={httpsUrl}
                    />
                </div>
            </div>
        );
    }

    renderError = () => {
        const {
            className,
            url,
        } = this.props;
        const {
            httpsUrl,
            invalidUrl,
        } = this.state;

        return (
            <div className={className}>
                {
                    !invalidUrl ?
                        <div styleName="error-website-msg">
                            <span>
                                {leadsString.cannotPreviewUrl}
                            </span>
                            <a
                                styleName="url"
                                href={httpsUrl || url}
                                target="_blank"
                            >
                                {httpsUrl || url}
                            </a>
                        </div>
                        :
                        <span styleName="error-website-msg">
                            {leadsString.invalidUrl}
                        </span>
                }
            </div>
        );
    }

    render() {
        const {
            pending,
            canShowIframe,
            mimeType,
            isDoc,
            httpsUrl,
        } = this.state;

        const {
            className,
            url,
        } = this.props;

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
                    <span styleName="waiting-text">
                        {leadsString.gatheringWebsiteInfoLabel}
                    </span>
                </div>
            );
        }

        if (isDoc) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={url}
                    mimeType={mimeType}
                    canShowIframe={canShowIframe}
                />
            );
        }

        return (
            (canShowIframe && (httpsUrl || window.location.protocol === 'http:')) ?
                this.renderIFrame() : this.renderError()
        );
    }
}
