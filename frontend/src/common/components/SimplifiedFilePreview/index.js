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
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
        this.previewId = undefined;
    }

    startProcess = () => {
        this.setState({ pending: true });
        if (this.props.preLoad) {
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

    create({ fileIds, previewId, onLoad }) {
        this.previewId = undefined;

        if (!fileIds || fileIds.length === 0) {
            this.reset(previewId);
            return;
        }

        this.startProcess();

        if (previewId) {
            if (this.previewRequest) {
                this.previewRequest.stop();
            }
            this.previewRequest = this.createPreviewRequest(previewId, onLoad);
            this.previewRequest.start();
            return;
        }

        this.triggerRequest = this.createTriggerRequest(fileIds, onLoad);
        this.triggerRequest.start();
    }

    createPreviewRequest = (previewId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForSimplifiedFilePreview(previewId))
            .params(createParamsForGenericGet())
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => !response.extracted)
            .success((response) => {
                // FIXME: write schema
                this.previewId = response.id;
                if (onLoad) {
                    onLoad(response);
                }
                this.endProcess({
                    error: undefined,
                    extractedText: response.text,
                });
            })
            .failure(() => {
                this.endProcess({
                    error: commonStrings.serverErrorText,
                });
            })
            .fatal(() => {
                this.endProcess({
                    error: commonStrings.connectionFailureText,
                });
            })
            .build()
    )

    createTriggerRequest = (fileIds, onLoad) => (
        new FgRestBuilder()
            .url(urlForFileExtractionTrigger)
            .params(createParamsForFileExtractionTrigger(fileIds))
            .success((response) => {
                // FIXME: write schema
                console.warn(`Triggering file extraction for ${fileIds.join(', ')}`);
                if (this.previewRequest) {
                    this.previewRequest.stop();
                }
                this.previewRequest = this.createPreviewRequest(
                    response.extractionTriggered,
                    onLoad,
                );
                this.previewRequest.start();
            })
            .failure(() => {
                this.endProcess({
                    error: commonStrings.serverErrorText,
                });
            })
            .fatal(() => {
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
                <p className={styles['simplified-text']}>
                    {extractedText}
                </p>
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
