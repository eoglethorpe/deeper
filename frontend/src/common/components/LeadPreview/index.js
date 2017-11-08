import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { RestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createUrlForLeadExtractionTrigger,
    createUrlForLeadPreview,
} from '../../../common/rest';
import {
    isFalsy,
} from '../../../public/utils/common';


const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.string,
};
const defaultProps = {
    className: '',
    leadId: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class LeadPreview extends React.PureComponent {
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
        this.destroy();
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
        const previewUrl = createUrlForLeadPreview(leadId);

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

        this.previewRequest = this.createLeadPreviewRequest(
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
                        setTimeout(() => {
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

    tryPreviewRequest = () => {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }

        if (this.previewRequestCount === 20) {
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
        const request = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
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

    createLeadPreviewRequest = (url, params, onSuccess) => {
        const request = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
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

    render() {
        const {
            className,
        } = this.props;

        const {
            pending,
            error,
            extractedText,
            images, // eslint-disable-line
        } = this.state;

        return (
            <div
                className={className}
                styleName="lead-preview"
            >
                {
                    (pending && (
                        <div>
                            Loading ...
                        </div>
                    )) ||
                        (error && (
                            <div>
                                { error }
                            </div>
                        )) ||
                        (extractedText && (
                            <pre>
                                { extractedText }
                            </pre>
                        )) ||
                        (
                            <div>
                                This lead has no valid preview
                            </div>
                        )
                }
            </div>
        );
    }
}
