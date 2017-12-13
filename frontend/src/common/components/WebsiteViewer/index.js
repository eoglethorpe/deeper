import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { iconNames } from '../../../common/constants';

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
                    if (response.headers['X-Frame-Options'] === 'SAMEORIGIN' &&
                        (!(response.headers['Set-Cookie'] || '').match('SECURE'))) {
                        this.setState({ canShow: false });
                    } else {
                        this.setState({ canShow: true, supportedUrl: response.url });
                    }
                } catch (err) {
                    this.setState({ canShow: false });
                }
            })
            .failure((response) => {
                console.error('Failure: ', response);
                this.setState({ canShow: false });
            })
            .fatal((response) => {
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

        return (
            canShow ?
                <iframe
                    // styleName="doc"
                    ref={(iframe) => { this.iframe = iframe; }}
                    sandbox="allow-scripts allow-same-origin"
                    className={className}
                    title={supportedUrl}
                    src={supportedUrl}
                    onLoad={this.onLoad}
                /> :
                <div className={className}>
                    This website doesnot allow view in other webiste, Open in new tab
                    <a
                        styleName="gallery-file-name"
                        href={url}
                        target="_blank"
                    >
                        {url}
                    </a>
                </div>
        );
    }
}
