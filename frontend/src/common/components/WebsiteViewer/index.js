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

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    urlForWebsiteFetch,
    createParamsForWebsiteFetch,
} from '../../../../src/common/rest';

const propTypes = {
    className: PropTypes.string,
    url: PropTypes.string,
};

const defaultProps = {
    className: '',
    url: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class DeepGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.initialState = {
            pending: false,
            canShow: false,
            mimeType: undefined,
            isSameOrigin: undefined,
            isSecure: undefined,
            isDoc: undefined,
            httpsUrl: undefined,
            invalidUrl: undefined,
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
                    const isSameOrigin = !!(response.headers['X-Frame-Options'] || '').toLowerCase().match('sameorigin');
                    const isSecure = !!(response.headers['Set-Cookie'] || '').toLowerCase().match('secure');
                    const mimeType = response.headers['Content-Type'];
                    const isDoc = GalleryMapping[mimeType] === ComponentType.DOC;
                    const httpsUrl = response.url;

                    this.setState({
                        canShow: true,
                        isSameOrigin,
                        isSecure,
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

    render() {
        const {
            pending,
            canShow,
            isSameOrigin,
            isSecure,
            mimeType,
            isDoc,
            httpsUrl,
            invalidUrl,
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
                    <span styleName="waiting-text">{leadsString.gatheringWebsiteInfoLabel}</span>
                </div>
            );
        }

        if (isDoc) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={url}
                    mimeType={mimeType}
                    isSameOrigin={isSameOrigin}
                />
            );
        }

        return (
            (canShow && !isSameOrigin && isSecure) ?
                <iframe
                    // styleName="doc"
                    sandbox="allow-scripts allow-same-origin"
                    className={className}
                    title={httpsUrl || url}
                    src={httpsUrl || url}

                /> :
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
}
