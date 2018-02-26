import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { isFalsy } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForGenericGet,
    createUrlForLeadExtractionTrigger,
    createUrlForSimplifiedLeadPreview,
} from '../../rest';
import { commonStringsSelector } from '../../redux';

import HighlightedText from '../HighlightedText';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    highlights: PropTypes.arrayOf(PropTypes.object),
    highlightModifier: PropTypes.func,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    leadId: undefined,
    highlights: [],
    highlightModifier: text => text,
    onLoad: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

@connect(mapStateToProps)
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
            highlights: [],
        };
    }

    componentDidMount() {
        this.calculateHighlights(this.props);
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.leadId !== nextProps.leadId) {
            this.create(nextProps);
        }

        if (this.props.highlights !== nextProps.highlights) {
            this.calculateHighlights(nextProps);
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
                    error: this.props.commonStrings('serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('connectionFailureText'),
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
                    }, () => {
                        this.calculateHighlights(this.props);
                    });
                    if (onLoad) {
                        onLoad(response);
                    }
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('connectionFailureText'),
                });
            })
            .build()
    )

    calculateHighlights({ highlights }) {
        const { extractedText } = this.state;
        if (!extractedText || !highlights) {
            this.setState({ highlights: [] });
            return;
        }

        this.setState({
            highlights: highlights.map((item) => {
                const start = item.text ? extractedText.indexOf(item.text) : item.start;
                const end = item.text ? item.text.length + start : item.end;
                return { start, end, item };
            }),
        });
    }

    renderContent = () => {
        const { highlightModifier } = this.props;

        const {
            error,
            extractedText,
            highlights,
        } = this.state;

        if (error) {
            return (
                <div className={styles.message}>
                    { error }
                </div>
            );
        } else if (extractedText) {
            return (
                <HighlightedText
                    className={styles['highlighted-text']}
                    text={extractedText}
                    highlights={highlights}
                    modifier={highlightModifier}
                />
            );
        }

        return (
            <div className={styles.message}>
                {this.props.commonStrings('previewNotAvailable')}
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
