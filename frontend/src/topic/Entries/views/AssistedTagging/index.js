import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentPrimaryButton,
    TransparentAccentButton,
    TransparentSuccessButton,
    TransparentWarningButton,
} from '../../../../public/components/Action';
import {
    FloatingContainer,
    ListView,
} from '../../../../public/components/View';
import {
    SelectInput,
} from '../../../../public/components/Input';

import {
    getColorOnBgColor,
    getHexFromString,
} from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';

import {
    iconNames,
} from '../../../../common/constants';
import {
    urlForLeadClassify,
    createParamsForLeadClassify,
} from '../../../../common/rest';

import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import styles from './styles.scss';

const NLP_THRESHOLD = 0.2;

const propTypes = {
    lead: PropTypes.object, // eslint-disable-line
    api: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
};

const emptyList = [];
const emptyObject = {};

@CSSModules(styles, { allowMultiple: true })
export default class AssistedTagging extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            assitedActionsVisible: false,
            activeHighlightRef: undefined,
            activeHighlightDetails: emptyObject,
            sectorOptions: emptyList,
            selectedSectors: emptyList,
            highlights: [],
        };
    }

    componentDidMount() {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }
    }

    highlightSimplifiedExcerpt = (highlight, text) => (
        <span
            role="presentation"
            className={styles['highlighted-excerpt']}
            style={{
                backgroundColor: highlight.color,
                color: getColorOnBgColor(highlight.color),
            }}
            onClick={e => this.handleOnHighlightClick(e, { ...highlight, text })}
        >
            {text}
        </span>
    );

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
            left: `${primaryContainerRect.left + 48}px`,
            width: `${primaryContainerRect.width - 96}px`,
            top: `${(cr.top + window.scrollY) + cr.height + 2}px`,
        };

        if (pageOffset < containerOffset + 32) {
            newStyle.top = `${cr.top - popupRect.height - 36}px`;
        }

        return newStyle;
    }

    handleOnHighlightClick = (e, activeHighlightDetails) => {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }

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
        const { api } = this.props;

        const existing = api.getEntryForExcerpt(text);
        if (existing) {
            api.selectEntryAndSetAttribute(existing.data.id);
        } else {
            api.addExcerpt(text);
        }
    }

    handleLeadPreviewLoad = (leadPreview) => {
        if (this.leadClassifyRequest) {
            this.leadClassifyRequest.stop();
        }
        this.leadClassifyRequest = this.createLeadClassifyRequest(leadPreview.classifiedDocId);
        this.leadClassifyRequest.start();
    }

    createLeadClassifyRequest = (docId) => {
        const request = new FgRestBuilder()
            .url(urlForLeadClassify)
            .params(createParamsForLeadClassify({
                deeper: 1,
                doc_id: docId,
            }))
            .success((response) => {
                try {
                    this.extractClassifications(response);
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

    extractClassifications = (data) => {
        const classification = data.classification;
        const sectorOptions = classification.map(c => ({
            key: c[0],
            label: c[0],
        }));
        const selectedSectors = sectorOptions.length > 0 ? [sectorOptions[0].key] : emptyList;

        this.nlpClassifications = data.excerpts_classification.map(excerpt => ({
            startPos: excerpt.start_pos,
            length: excerpt.end_pos - excerpt.start_pos,
            sectors: excerpt.classification.filter(c => c[1] > NLP_THRESHOLD).map(c => ({
                label: c[0],
                confidence: `${Math.round(c[1] * 100)}%`,
            })),
        })).filter(c => c.sectors.length > 0);

        this.setState({ sectorOptions, selectedSectors });

        this.refreshClassifications();
    }

    handleSectorSelect = (selectedSectors) => {
        this.setState({ selectedSectors }, () => {
            this.refreshClassifications();
        });
    }

    refreshClassifications = () => {
        const { selectedSectors } = this.state;
        const { nlpClassifications } = this;

        const filteredClassifications = (selectedSectors.length === 0) ?
            nlpClassifications : (
                nlpClassifications.filter(excerpt => (
                    selectedSectors.reduce((acc, sector) => acc ||
                        excerpt.sectors.find(s => s.label === sector), false)
                ))
            );

        const highlights = filteredClassifications.map(excerpt => ({
            ...excerpt,
            color: getHexFromString(excerpt.sectors[0].label),
            source: 'NLP',
        }));
        this.setState({ highlights });
    }

    calcSectorKey = d => d.label;

    renderSectorList = (key, sector) => {
        const { activeHighlightDetails } = this.state;

        return (
            <div
                key={sector.label}
                className={styles.sector}
            >
                <div className={styles['sector-text']}>
                    {sector.label} {sector.confidence}
                </div>
                <div className={styles['feedback-buttons']}>
                    <TransparentSuccessButton
                        title="Its accurate"
                    >
                        <span className={iconNames.thumbsUp} />
                    </TransparentSuccessButton>
                    <TransparentWarningButton
                        title="Its not accurate"
                    >
                        <span className={iconNames.thumbsDown} />
                    </TransparentWarningButton>
                </div>
            </div>
        );
    }

    render() {
        const { lead } = this.props;
        const {
            activeHighlightDetails,
            assitedActionsVisible,
            sectorOptions,
            selectedSectors,
            highlights,
        } = this.state;

        return (
            <div
                ref={(el) => { this.primaryContainer = el; }}
                styleName={assitedActionsVisible ? 'assisted-tagging faded' : 'assisted-tagging'}
            >
                <SimplifiedLeadPreview
                    styleName="text"
                    leadId={lead.id}
                    highlights={highlights}
                    highlightModifier={this.highlightSimplifiedExcerpt}
                    onLoad={this.handleLeadPreviewLoad}
                />
                <div styleName="suggestion-select">
                    <span>Show suggestions for:</span>
                    <SelectInput
                        styleName="select-input"
                        options={sectorOptions}
                        showHintAndError={false}
                        value={selectedSectors}
                        onChange={this.handleSectorSelect}
                        multiple
                    />
                </div>
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
                            <div styleName="title">
                                <span styleName="label">Source:</span>
                                <span styleName="source">{activeHighlightDetails.source}</span>
                            </div>
                            <TransparentPrimaryButton
                                onClick={this.handleOnCloseAssistedActions}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        </header>
                        <div styleName="info-bar">
                            <span>{activeHighlightDetails.text}</span>
                        </div>
                        <ListView
                            styleName="sectors"
                            modifier={this.renderSectorList}
                            data={activeHighlightDetails.sectors}
                            keyExtractor={this.calcSectorKey}
                        />
                        <TransparentAccentButton
                            className={styles['add-button']}
                            onClick={() => this.handleEntryAdd(
                                activeHighlightDetails.text,
                            )}
                        >
                            Add
                        </TransparentAccentButton>
                    </div>
                </FloatingContainer>
            </div>
        );
    }
}
