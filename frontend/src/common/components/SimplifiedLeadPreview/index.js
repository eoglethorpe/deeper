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
import {
    commonStrings,
} from '../../../common/constants';

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
    onLoad: undefined,
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
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
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
    }

    getHighlights() {
        const { highlights } = this.props;
        const { extractedText } = this.state;

        return highlights.map(h => ({
            start: h.text ? extractedText.indexOf(h.text) : h.startPos,
            length: h.text ? h.text.length : h.length,
            item: h,
        }));
    }

    // TODO Since this is also called by componentWillReceiveProps,
    // take in the `props` param
    create({ leadId, onLoad }) {
        if (!leadId) {
            return;
        }

        this.setState({ pending: true });
        this.hasTriggeredOnce = false;

        if (this.previewRequest) {
            this.previewRequest.stop();
        }
        this.previewRequest = this.createPreviewRequest(leadId, onLoad);
        this.previewRequest.start();
    }

    createTriggerRequest = (leadId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForLeadExtractionTrigger(leadId))
            .params(createParamsForGenericGet())
            .success(() => {
                console.log(`Triggered lead extraction for ${leadId}`);
                this.previewRequest.stop();
                this.previewRequest = this.createPreviewRequest(leadId, onLoad);
                this.previewRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: commonStrings.serverErrorText,
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: commonStrings.connectionFailureText,
                });
            })
            .build()
    )

    createPreviewRequest = (leadId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForSimplifiedLeadPreview(leadId))
            .params(createParamsForGenericGet())
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => (
                this.hasTriggeredOnce &&
                isFalsy(response.text) &&
                response.images.length === 0
            ))
            .success((response) => {
                if (isFalsy(response.text) && response.images.length === 0) {
                    this.hasTriggeredOnce = true;
                    if (this.triggerRequest) {
                        this.triggerRequest.stop();
                    }
                    this.triggerRequest = this.createTriggerRequest(leadId);
                    this.triggerRequest.start();
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        extractedText: response.text,
                        extractedImages: response.images,
                    });
                    if (onLoad) {
                        onLoad(response);
                    }
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: commonStrings.serverErrorText,
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: commonStrings.connectionFailureText,
                });
            })
            .build()
    )

    renderContent = () => {
        const { highlightModifier } = this.props;

        const {
            error,
            extractedText,
        } = this.state;

        if (error) {
            return (
                <div className={styles.message}>
                    { error }
                </div>
            );
        }

        if (extractedText) {
            return (
                <HighlightedText
                    className={styles['highlighted-text']}
                    text={extractedText}
                    highlights={this.getHighlights()}
                    modifier={highlightModifier}
                />
            );
        }

        return (
            <div className={styles.message}>
                {commonStrings.previewNotAvailable}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        const Content = this.renderContent;

        return (
            <div
                className={className}
                styleName="lead-preview"
            >
                {
                    pending ? (
                        <LoadingAnimation />
                    ) : (
                        <Content />
                    )
                }
            </div>
        );
    }
}
