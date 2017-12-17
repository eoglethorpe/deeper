import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import HighlightedText from '../HighlightedText';
import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createUrlForLeadExtractionTrigger,
    createUrlForSimplifiedLeadPreview,
} from '../../../common/rest';
import {
    LoadingAnimation,
} from '../../../public/components/View';
import {
    isFalsy,
} from '../../../public/utils/common';

const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    highlights: PropTypes.arrayOf(PropTypes.object),
    highlightModifier: PropTypes.func,
};
const defaultProps = {
    className: '',
    leadId: undefined,
    highlights: [],
    highlightModifier: text => text,
};


@CSSModules(styles, { allowMultiple: true })
export default class SimplifiedLeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            error: undefined,
            extractedText: null,
            extractedImages: [],
        };

        this.triggerRequest = undefined;
        this.previewRequest = undefined;
    }

    componentDidMount() {
        this.recreate();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            this.recreate();
        }
    }

    componentWillUnmount() {
        if (this.previewRequestTimeout) {
            clearTimeout(this.previewRequestTimeout);
        }
        this.destroy();
    }

    getHighlights() {
        const { highlights } = this.props;
        const { extractedText } = this.state;

        return highlights.map(h => ({
            start: extractedText.indexOf(h.text),
            length: h.text.length,
            item: h,
        }));
    }

    destroy() {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    recreate() {
        this.destroy();

        /**
         * Get lead preview
         * If null, trigger one
         * Either use websocket or polling to check if lead preview can be obtained
         * If failed or timeout, show error
         */

        const {
            leadId,
        } = this.props;

        if (!leadId) {
            return;
        }

        const params = createParamsForGenericGet();
        const triggerUrl = createUrlForLeadExtractionTrigger(leadId);
        const previewUrl = createUrlForSimplifiedLeadPreview(leadId);

        this.setState({ pending: true });

        this.previewRequestCount = 0;
        this.triggerRequest = this.createLeadExtractionTriggerRequest(
            triggerUrl,
            params,
            () => {
                console.log(`Triggered lead extraction for ${leadId}`);
                this.tryPreviewRequest();
            },
        );

        this.previewRequest = this.createSimplifiedLeadPreviewRequest(
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
                        }, 500);
                    }
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        extractedText: response.text,
                        extractedImages: response.images,
                    });
                }
            },
        );

        this.previewRequest.start();
    }

    tryPreviewRequest = (maxCount = 20) => {
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

    createLeadExtractionTriggerRequest = (url, params, onSuccess) => {
        const request = new FgRestBuilder()
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
            .build();
        return request;
    }

    createSimplifiedLeadPreviewRequest = (url, params, onSuccess) => {
        const request = new FgRestBuilder()
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
            .build();
        return request;
    }

    renderContent() {
        const {
            highlightModifier,
        } = this.props;

        const {
            error,
            extractedText,
            images, // eslint-disable-line
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    Preview Error
                </div>
            );
        }

        if (extractedText) {
            return (
                <HighlightedText
                    text={extractedText}
                    highlights={this.getHighlights()}
                    modifier={highlightModifier}
                />
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
                styleName="lead-preview"
            >
                {
                    (pending && (
                        <LoadingAnimation styleName="message" />
                    )) || (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
