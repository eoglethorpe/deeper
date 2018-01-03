import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createParamsForFileExtractionTrigger,
    createUrlForSimplifiedFilePreview,
    urlForFileExtractionTrigger,
} from '../../../common/rest';
import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
    fileIds: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ),
    previewId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func,
    preLoad: PropTypes.func,
    postLoad: PropTypes.func,
};
const defaultProps = {
    className: '',
    fileIds: [],
    previewId: undefined,
    preLoad: undefined,
    postLoad: undefined,
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
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.fileIds !== nextProps.fileIds ||
            this.props.previewId !== nextProps.previewId) {
            this.create(nextProps);
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

    create(props) {
        this.destroy();

        const {
            fileIds,
            previewId,
        } = props;

        if (!fileIds || fileIds.length === 0) {
            // reset if preview id is also not set
            if (!previewId) {
                this.setState({
                    error: undefined,
                    extractedText: null,
                });
            }

            if (this.props.onLoad) {
                this.props.onLoad({});
            }
            return;
        }

        this.setState({ pending: true });

        if (previewId) {
            this.createPreviewRequest(previewId);
            return;
        }

        const triggerParams = createParamsForFileExtractionTrigger(fileIds);
        const triggerUrl = urlForFileExtractionTrigger;

        this.previewRequestCount = 0;
        this.triggerRequest = this.createRequest(
            triggerUrl,
            triggerParams,
            (response) => {
                this.createPreviewRequest(response.extractionTriggered);
                console.log(`Triggered file extraction for ${fileIds.join(', ')}`);
            },
        );

        this.triggerRequest.start();
    }

    createPreviewRequest = (previewId) => {
        const { onLoad } = this.props;
        const params = createParamsForGenericGet();
        const previewUrl = createUrlForSimplifiedFilePreview(previewId);

        this.previewRequest = this.createRequest(
            previewUrl,
            params,
            (response) => {
                if (!response.extracted) {
                    // Keep trying
                    this.previewRequestTimeout = setTimeout(() => {
                        this.tryPreviewRequest();
                    }, 1000);
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
            .preLoad(() => {
                if (this.props.preLoad) {
                    this.props.preLoad();
                }
            })
            .postLoad(() => {
                if (this.props.postLoad) {
                    this.props.postLoad();
                }
            })
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
