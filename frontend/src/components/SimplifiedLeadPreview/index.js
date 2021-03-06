import PropTypes from 'prop-types';
import React from 'react';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { isFalsy } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForGet,
    createUrlForLeadExtractionTrigger,
    createUrlForSimplifiedLeadPreview,
} from '../../rest';
import _ts from '../../ts';

import HighlightedText from '../HighlightedText';
import styles from './styles.scss';

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

export default class SimplifiedLeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getHighlightColors = (color) => {
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);

        const backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
        const borderColor = color;
        const labelColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

        return {
            background: backgroundColor,
            border: borderColor,
            label: labelColor,
        };
    };

    static highlightModifier = (highlight, text, actualStr, onClick, className = '') => {
        const colors = SimplifiedLeadPreview.getHighlightColors(highlight.color);
        const clickHandler = onClick && ((e) => {
            onClick(e, {
                ...highlight,
                text: actualStr,
            });
            e.stopPropagation();
        });
        const dragHandler = (e) => {
            e.dataTransfer.setData('text/plain', actualStr);
            e.stopPropagation();
        };
        const style = {
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
        };

        return (
            <span
                role="presentation"
                className={`${styles.highlight} ${className}`}
                style={style}
                onClick={clickHandler}
                onDragStart={dragHandler}
                draggable
            >
                <span className={styles.text}>
                    {text}
                </span>
                {highlight.label && (
                    <span
                        className={styles.label}
                        style={{
                            backgroundColor: colors.label,
                        }}
                    >
                        { highlight.label }
                    </span>
                )}
            </span>
        );
    };

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
            .params(createParamsForGet)
            .success(() => {
                console.log(`Triggered lead extraction for ${leadId}`);
                this.previewRequest.stop();
                this.previewRequest = this.createPreviewRequest(leadId, onLoad);
                this.previewRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('common', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('common', 'connectionFailureText'),
                });
            })
            .build()
    )

    createPreviewRequest = (leadId, onLoad) => (
        new FgRestBuilder()
            .url(createUrlForSimplifiedLeadPreview(leadId))
            .params(createParamsForGet)
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
                    error: _ts('common', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('common', 'connectionFailureText'),
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
                    className={styles.highlightedText}
                    text={extractedText}
                    highlights={highlights}
                    modifier={highlightModifier}
                />
            );
        }

        return (
            <div className={styles.message}>
                {_ts('common', 'previewNotAvailable')}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        const Content = this.renderContent;

        return (
            <div className={`${className} ${styles.leadPreview}`}>
                {
                    pending ? (
                        <LoadingAnimation
                            message={_ts('common', 'simplifyingLead')}
                            small
                        />
                    ) : (
                        <Content />
                    )
                }
            </div>
        );
    }
}
