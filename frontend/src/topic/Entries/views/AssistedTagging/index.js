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
    getContrastYIQ,
} from '../../../../public/utils/common';

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
            assitedActionsVisible: false,
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

    componentDidMount() {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }
    }

    highlightSimplifiedExcerpt = (highlight, text) => {
        console.warn();
        return (
            <span
                role="presentation"
                className={styles['highlighted-excerpt']}
                style={{
                    backgroundColor: highlight.color,
                    color: getContrastYIQ(highlight.color),
                }}
                onClick={e => this.handleOnHighlightClick(e, highlight)}
            >
                {text}
            </span>
        );
    };

    handleDynamicStyleOverride = (popupContainer) => {
        const { activeHighlightRef } = this.state;

        const popupRect = popupContainer.getBoundingClientRect();
        const cr = (activeHighlightRef && activeHighlightRef.getBoundingClientRect())
            || this.boundingClientRect;

        const pageOffset = window.innerHeight;
        const containerOffset = cr.top + popupRect.height + cr.height;
        const primaryContainerRect = this.primaryContainerRect || (
            this.primaryContainer && this.primaryContainer.getBoundingClientRect());

        if (!primaryContainerRect) {
            return null;
        }

        const newStyle = {
            left: `${primaryContainerRect.left}px`,
            width: `${primaryContainerRect.width}px`,
            top: `${(cr.top + window.scrollY) + cr.height + 2}px`,
        };

        if (pageOffset < containerOffset) {
            newStyle.top = `${cr.top - popupRect.height - 36}px`;
        }

        return newStyle;
    }

    handleOnHighlightClick = (e, activeHighlightDetails) => {
        this.setState({
            assitedActionsVisible: true,
            activeHighlightRef: e.target,
            activeHighlightDetails,
        });
    }

    handleOnCloseAssistedActions = () => {
        this.setState({ assitedActionsVisible: false });
    }

    handleEntryAdd = (text) => {
        console.log(text);
    }

    render() {
        const { lead } = this.props;
        const {
            activeHighlightDetails,
            assitedActionsVisible,
        } = this.state;

        return (
            <div
                ref={(el) => { this.primaryContainer = el; }}
                styleName="assisted-tagging"
            >
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
                    onClose={this.handleOnCloseAssistedActions}
                    show={assitedActionsVisible}
                >
                    <div styleName="assisted-actions">
                        <header styleName="header">
                            <TransparentButton
                                styleName="button"
                                onClick={this.handleOnCloseAssistedActions}
                            >
                                <span className={iconNames.remove} />
                            </TransparentButton>
                        </header>
                        <div styleName="info-bar">
                            <header>
                                <span>{activeHighlightDetails.source}</span>
                                <span>{activeHighlightDetails.confidence}</span>
                            </header>
                            <span>{activeHighlightDetails.text}</span>
                        </div>
                        <div styleName="action-buttons">
                            <TransparentButton
                                styleName="button"
                                onClick={() => this.handleEntryAdd(activeHighlightDetails.text)}
                            >
                                Apply
                            </TransparentButton>
                            <div styleName="feedback">
                                <TransparentButton
                                    title="Its accurate"
                                    styleName="button"
                                >
                                    <span className={iconNames.thumbsUp} />
                                </TransparentButton>
                                <TransparentButton
                                    title="Its not accurate"
                                    styleName="button"
                                >
                                    <span className={iconNames.thumbsDown} />
                                </TransparentButton>
                            </div>
                        </div>
                    </div>
                </FloatingContainer>
            </div>
        );
    }
}
