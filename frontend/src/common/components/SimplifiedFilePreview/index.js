import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createUrlForFileExtractionTrigger,
    createUrlForSimplifiedFilePreview,
} from '../../../common/rest';
import {
    LoadingAnimation,
} from '../../../public/components/View';
import {
    isFalsy,
} from '../../../public/utils/common';

const propTypes = {
    className: PropTypes.string,
    fileId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func,
};
const defaultProps = {
    className: '',
    fileId: undefined,
    onLoad: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class SimplifiedFilePreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            error: undefined,
            extractedText: null,
        };

        this.triggerRequest = undefined;
        this.previewRequest = undefined;
    }

    componentDidMount() {
        this.create();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.fileId !== nextProps.fileId) {
            this.create();
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    destroy() {
        if (this.previewRequestTimeout) {
            clearTimeout(this.previewRequestTimeout);
        }
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    create() {
        this.destroy();

        /**
         * Get file preview
         * If null, trigger one
         * Either use websocket or polling to check if file preview can be obtained
         * If failed or timeout, show error
         */

        const {
            fileId,
            onLoad,
        } = this.props;

        if (!fileId) {
            return;
        }

        const params = createParamsForGenericGet();
        const triggerUrl = createUrlForFileExtractionTrigger(fileId);
        const previewUrl = createUrlForSimplifiedFilePreview(fileId);

        this.setState({ pending: true });

        this.previewRequestCount = 0;
        this.triggerRequest = this.createRequest(
            triggerUrl,
            params,
            () => {
                console.log(`Triggered file extraction for ${fileId}`);
                this.tryPreviewRequest();
            },
        );

        this.previewRequest = this.createRequest(
            previewUrl,
            params,
            (response) => {
                if (isFalsy(response.text) && response.images.length === 0) {
                    // There is no preview
                    if (this.previewRequestCount === 0) {
                        // Trigger an extraction if this is the first time
                        this.triggerRequest.start();
                    } else {
                        // Otherwise try a few more times
                        this.previewRequestTimeout = setTimeout(() => {
                            this.tryPreviewRequest();
                        }, 1000);
                    }
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        extractedText: response.text,
                    });
                    if (onLoad) {
                        onLoad(response);
                    }
                }
            },
        );

        this.previewRequest.start();
    }

    tryPreviewRequest = (maxCount = 30) => {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }

        if (this.previewRequestCount === maxCount) {
            this.setState({
                pending: false,
                error: undefined,
                extractedText: null,
                extractedImages: [],
            });
            return;
        }

        this.previewRequestCount += 1;
        this.previewRequest.start();
    }

    createRequest = (url, params, onSuccess) => (
        new FgRestBuilder()
            .url(url)
            .params(params)
            .success((response) => {
                try {
                    onSuccess(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
                });
            })
            .build()
    )

    renderContent() {
        const {
            error,
            extractedText,
            images, // eslint-disable-line
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (extractedText) {
            return (
                <pre>
                    {extractedText}
                </pre>
            );
        }

        return (
            <div styleName="message">
                Preview Not Available
            </div>
        );
    }

    render() {
        const {
            className,
        } = this.props;

        const {
            pending,
        } = this.state;

        return (
            <div
                className={className}
                styleName="file-preview"
            >
                {
                    (pending && (
                        <LoadingAnimation />
                    )) || (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
