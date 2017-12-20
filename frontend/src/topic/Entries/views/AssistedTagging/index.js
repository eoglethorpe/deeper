import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentButton,
} from '../../../../public/components/Action';
import {
    FloatingContainer,
} from '../../../../public/components/View';
import {
    iconNames,
} from '../../../../common/constants';
import {
    SelectInput,
} from '../../../../public/components/Input';

import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class AssistedTagging extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            assistedActionsHover: false,
            assistedHighlightHover: false,
            activeHighlightRef: undefined,
            activeHighlightDetails: {},
        };

        this.highlights = [
            {
                text: 'Yemen’s food has to be imported and since a Saudi-led coalition imposed a blockade',
                color: '#e74c3c',
                source: 'NLP',
                confidence: 80,
            },
            {
                text: 'acute risk of famine',
                color: '#3498db',
                source: 'Category Editor',
            },
            {
                text: 'SC 039042',
                color: '#3498db',
                source: 'NLP',
                confidence: 80,
            },
        ];
    }

    highlightSimplifiedExcerpt = (highlight, text) => {
        console.warn();
        return (
            <span
                className={styles['highlighted-excerpt']}
                style={{ backgroundColor: highlight.color }}
                onMouseEnter={e => this.handleOnMouseEnter(e, highlight)}
                onMouseLeave={this.handleOnMouseLeave}
            >
                {text}
            </span>
        );
    };

    handleDynamicStyleOverride = (pickerContainer) => {
        const { activeHighlightRef } = this.state;

        const pickerRect = pickerContainer.getBoundingClientRect();
        const cr = (activeHighlightRef && activeHighlightRef.getBoundingClientRect())
            || this.boundingClientRect;

        const pageOffset = window.innerHeight;
        const containerOffset = cr.top + pickerRect.height + cr.height;

        const newStyle = {
            left: `${cr.right - 12}px`,
            top: `${(cr.top + window.scrollY) + cr.height + 2}px`,
        };

        if (pageOffset < containerOffset) {
            newStyle.top = `${cr.top - pickerRect.height - 12}px`;
        }

        return newStyle;
    }

    handleOnMouseEnter = (e, activeHighlightDetails) => {
        this.setState({
            assistedHighlightHover: true,
            activeHighlightRef: e.target,
            activeHighlightDetails,
        });
    }

    handleOnMouseLeave = () => {
        this.setState({ assistedHighlightHover: false });
    }

    handleOnMouseEnterAssisted = () => {
        this.setState({ assistedActionsHover: true });
    }

    handleOnMouseLeaveAssisted = () => {
        this.setState({ assistedActionsHover: false });
    }

    handleEntryAdd = (text) => {
        console.log(text);
    }

    render() {
        const { lead } = this.props;
        const {
            assistedActionsHover,
            activeHighlightDetails,
            assistedHighlightHover,
        } = this.state;

        return (
            <div styleName="assisted-tagging">
                <div styleName="suggestion-select">
                    <span>Show suggestions for:</span>
                    <SelectInput
                        styleName="select-input"
                        showHintAndError={false}
                    />
                </div>
                <SimplifiedLeadPreview
                    styleName="text"
                    leadId={lead.id}
                    highlights={this.highlights}
                    highlightModifier={this.highlightSimplifiedExcerpt}
                />
                <FloatingContainer
                    closeOnBlur
                    parentContainer={this.state.activeHighlightRef}
                    onDynamicStyleOverride={this.handleDynamicStyleOverride}
                    containerId="assisted-actions-container"
                    onClose={this.handleOnMouseLeave}
                    show={assistedActionsHover || assistedHighlightHover}
                >
                    <div
                        onMouseEnter={this.handleOnMouseEnterAssisted}
                        onMouseLeave={this.handleOnMouseLeaveAssisted}
                        ref={(el) => { this.assitedActionContainer = el; }}
                        styleName="assisted-actions"
                    >
                        <div styleName="info-bar">
                            <span>{activeHighlightDetails.source}</span>
                            <span>{activeHighlightDetails.confidence}</span>
                        </div>
                        <div styleName="action-buttons">
                            <TransparentButton
                                styleName="button"
                                onClick={() => this.handleEntryAdd(activeHighlightDetails.text)}
                            >
                                <span className={iconNames.add} />
                            </TransparentButton>
                            <TransparentButton
                                styleName="button"
                            >
                                <span className={iconNames.close} />
                            </TransparentButton>
                        </div>
                    </div>
                </FloatingContainer>
            </div>
        );
    }
}
