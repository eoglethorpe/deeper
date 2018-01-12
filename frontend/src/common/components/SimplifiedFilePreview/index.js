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

import {
    commonStrings,
} from '../../../common/constants';

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
        // NOTE: checking this.previewId is intentional
        // don't confuse with this.props.previewId
        if (this.props.fileIds !== nextProps.fileIds ||
            this.previewId !== nextProps.previewId) {
            this.create(nextProps);
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    startProcess = () => {
        this.setState({ pending: true });
        if (this.props.preLoad()) {
            this.props.preLoad();
        }
    }

    endProcess = (values) => {
        this.setState({
            pending: false,
            ...values,
        });
        if (this.props.postLoad) {
            this.props.postLoad();
        }
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
        this.previewId = undefined;
    }

    reset = (previewId) => {
        // reset if preview id is also not set
        if (!previewId) {
            this.setState({
                error: undefined,
                extractedText: null,
            });

            if (this.props.onLoad) {
                this.props.onLoad({});
            }
        }
    }

    create(props) {
        this.destroy();

        const {
            fileIds,
            previewId,
        } = props;

        if (!fileIds || fileIds.length === 0) {
            this.reset(previewId);
            return;
        }

        this.startProcess();

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
                // FIXME: write schema
                console.warn(`Triggering file extraction for ${fileIds.join(', ')}`);
                this.createPreviewRequest(response.extractionTriggered);
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
                // FIXME: write schema
                if (!response.extracted) {
                    // Keep trying
                    this.previewRequestTimeout = setTimeout(() => {
                        this.tryPreviewRequest();
                    }, 1000);
                } else {
                    this.previewId = response.id;
                    if (onLoad) {
                        onLoad(response);
                    }
                    this.endProcess({
                        error: undefined,
                        extractedText: response.text,
                    });
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
            this.endProcess({
                error: undefined,
                extractedText: null,
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
                console.error(response);
                this.endProcess({
                    error: commonStrings.serverErrorText,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.endProcess({
                    error: commonStrings.connectionFailureText,
                });
            })
            .build()
    )

    renderContent() {
        const {
            error,
            extractedText,
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
                {commonStrings.previewNotAvailable}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        return (
            <div
                className={className}
                styleName="file-preview"
            >
                {
                    pending ? (
                        <LoadingAnimation />
                    ) : (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
