import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import AccentButton from '../../../public/components/Action/Button/AccentButton';
import TextInput from '../../../public/components/Input/TextInput';

import Screenshot from '../../components/Screenshot';
import GalleryDocs from '../../components/DeepGallery/components/GalleryDocs';
import { GalleryMapping, ComponentType } from '../../components/DeepGallery';
import { leadsStringsSelector } from '../../redux';
import { iconNames } from '../../constants';
import {
    urlForWebsiteFetch,
    createParamsForWebsiteFetch,
} from '../../rest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
    showUrl: PropTypes.bool,
    showScreenshot: PropTypes.bool,
    onScreenshotCapture: PropTypes.func,
    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    url: undefined,
    showUrl: false,
    showScreenshot: false,
    onScreenshotCapture: undefined,
};

const mapStateToProps = state => ({
    leadsStrings: leadsStringsSelector(state),
});

@connect(mapStateToProps)
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
    }

    componentWillMount() {
        console.warn('WebsiteViewer is deprecated, Please use WebsiteViewer component');
        if (this.props.url) {
            this.urlRequest = this.createRequestForUrl(this.props.url);
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

    getContainerClassName = () => {
        const { className, showUrl } = this.props;
        const classNames = [
            className,
            'website-viewer',
            styles['website-viewer'],
        ];
        if (showUrl) {
            classNames.push(styles['urlbar-shown']);
        }
        return classNames.join(' ');
    }

    getDocContainerClassName = () => {
        const docContainerClassNames = [
            styles['doc-container'],
            'doc-container',
        ];
        return docContainerClassNames.join(' ');
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

    renderPendingScreen = () => (
        <div styleName="pending-container">
            <span
                className={iconNames.loading}
                styleName="loading-animation"
            />
            <span styleName="waiting-text">
                {this.props.leadsStrings('gatheringWebsiteInfoLabel')}
            </span>
        </div>
    )

    renderBar = (previewError) => {
        const { httpsUrl, invalidUrl } = this.state;
        const { url, showUrl, showScreenshot } = this.props;

        const isUrlShowable = showUrl || previewError;
        const isScreenshotable = showScreenshot && !previewError;

        if (!isUrlShowable) {
            return null;
        }

        return (
            <div styleName="urlbar">
                <TextInput
                    styleName="url"
                    value={httpsUrl || url}
                    readOnly
                    showLabel={false}
                    showHintAndError={false}
                    selectOnFocus
                />
                { !invalidUrl &&
                    <div styleName="action-buttons">
                        <a
                            styleName="open-link"
                            href={httpsUrl || url}
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

    renderIframe = () => {
        const {
            screenshotMode,
            httpsUrl,
        } = this.state;
        const { url } = this.props;

        const docContainerClassName = this.getDocContainerClassName();
        return (
            <div className={docContainerClassName}>
                { screenshotMode && <Screenshot onCapture={this.handleScreenshot} /> }
                <iframe
                    styleName="doc"
                    sandbox="allow-scripts allow-same-origin"
                    title={httpsUrl || url}
                    src={httpsUrl || url}
                />
            </div>
        );
    }

    renderErrorScreen = () => {
        const { invalidUrl } = this.state;
        return (
            <div styleName="error-website-msg">
                <span>
                    {
                        invalidUrl
                            ? this.props.leadsStrings('invalidUrl')
                            : this.props.leadsStrings('cannotPreviewUrl')
                    }
                </span>
            </div>
        );
    }

    render() {
        const {
            canShowIframe,
            httpsUrl,
            isDoc,
            mimeType,
            pending,
            screenshotMode,
        } = this.state;

        const {
            className,
            url,
        } = this.props;

        const containerClassName = this.getContainerClassName();

        // NOTE: Error can occur if
        // 1. We cannot show iframe
        // 2. If there is no alternative https url and current url is http
        const previewError = !canShowIframe || (!httpsUrl && window.location.protocol !== 'http:');

        if (pending) {
            return this.renderPendingScreen();
        } else if (isDoc) {
            return (
                <div className={containerClassName}>
                    { this.renderBar(previewError) }
                    { screenshotMode && <Screenshot onCapture={this.handleScreenshot} /> }
                    <GalleryDocs
                        className={className}
                        docUrl={url}
                        mimeType={mimeType}
                        canShowIframe={canShowIframe}
                    />
                </div>
            );
        } // else website

        return (
            <div className={containerClassName}>
                { this.renderBar(previewError)}
                { !previewError ? this.renderIframe() : this.renderErrorScreen() }
            </div>
        );
    }
}
