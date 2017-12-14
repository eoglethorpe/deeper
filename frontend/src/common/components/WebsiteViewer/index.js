import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { iconNames } from '../../../common/constants';
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

        this.state = {
            pending: true,
            canShow: false,
            mimeType: undefined,
        };

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
                    const isSameOrigin = (response.headers['X-Frame-Options'] || '').toLowerCase().match('sameorigin');
                    const isSecure = (response.headers['Set-Cookie'] || '').toLowerCase().match('secure');

                    if (isSameOrigin && !isSecure) {
                        // can't display in our website
                        this.setState({ canShow: false, supportedUrl: response.httpUrl });
                    } else {
                        this.setState({
                            canShow: true,
                            supportedUrl: response.url,
                            mimeType: response.headers['Content-Type'],
                        });
                    }
                } catch (err) {
                    this.setState({ canShow: false });
                }
            })
            .failure((response) => {
                // server can't fetch the url
                console.error('Failure: ', response);
                this.setState({ canShow: false });
            })
            .fatal((response) => {
                // server can't fetch the url
                console.error('Fatal: ', response);
                this.setState({ canShow: false });
            })
            .build();

        return urlRequest;
    }

    render() {
        const {
            pending,
            canShow,
            supportedUrl,
            mimeType,
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
                </div>
            );
        }

        if (GalleryMapping[mimeType] === ComponentType.DOC) {
            return (
                <GalleryDocs
                    className={className}
                    docUrl={url}
                    // mimeType={mimeType}
                />
            );
        }

        return (
            canShow ?
                <iframe
                    // styleName="doc"
                    sandbox="allow-scripts allow-same-origin"
                    className={className}
                    title={supportedUrl}
                    src={supportedUrl}
                /> :
                <div className={className}>
                    <span>This website doesnot allow view in other webiste, Open in new tab
                        {
                            supportedUrl ?
                                <a
                                    styleName="gallery-file-name"
                                    href={supportedUrl}
                                    target="_blank"
                                >
                                    {supportedUrl}
                                </a> :
                                <a
                                    styleName="gallery-file-name"
                                    href={url}
                                    target="_blank"
                                >
                                    {url}
                                </a>
                        }
                    </span>
                </div>
        );
    }
}
