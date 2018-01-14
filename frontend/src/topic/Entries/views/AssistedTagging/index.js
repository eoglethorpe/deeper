import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    PrimaryButton,
    TransparentPrimaryButton,
    TransparentSuccessButton,
    TransparentWarningButton,
    SegmentButton,
} from '../../../../public/components/Action';
import {
    FloatingContainer,
    ListView,
} from '../../../../public/components/View';
import {
    MultiSelectInput,
} from '../../../../public/components/Input';

import {
    getColorOnBgColor,
    getHexFromString,
} from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';
import notify from '../../../../common/notify';
import schema from '../../../../common/schema';

import {
    iconNames,
    entryStrings,
} from '../../../../common/constants';
import {
    urlForLeadClassify,
    urlForNer,
    urlForFeedback,
    createUrlForCeClassify,
    createParamsForLeadClassify,
    createParamsForCeClassify,
    createParamsForNer,
    createParamsForFeedback,
} from '../../../../common/rest';

import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import styles from './styles.scss';

// const NLP_THRESHOLD = 0;

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
            nlpSectorOptions: emptyList,
            nlpSelectedSectors: emptyList,
            ceSectorOptions: emptyList,
            ceSelectedSectors: emptyList,
            nerSectorOptions: emptyList,
            nerSelectedSectors: emptyList,
            selectedAssitedTaggingSource: 'nlp',
            highlights: [],
        };

        this.assitedTaggingSources = [
            {
                label: entryStrings.nlpLabel,
                value: 'nlp',
            },
            {
                label: entryStrings.entitiesLabel,
                value: 'ner',
            },
            {
                label: entryStrings.ceLabel,
                value: 'ce',
            },
        ];
    }

    componentDidMount() {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }
    }

    componentWillUnmount() {
        if (this.nlpClassifyRequest) {
            this.nlpClassifyRequest.stop();
        }

        if (this.ceClassifyRequest) {
            this.ceClassifyRequest.stop();
        }

        if (this.nerClassifyRequest) {
            this.nerClassifyRequest.stop();
        }

        if (this.feedbackRequest) {
            this.feedbackRequest.stop();
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

    handleAssitedBoxInvalidate = (popupContainer) => {
        const popupRect = popupContainer.getBoundingClientRect();
        const primaryContainerRect = this.primaryContainerRect || (
            this.primaryContainer && this.primaryContainer.getBoundingClientRect());

        if (!primaryContainerRect) {
            return null;
        }

        const newStyle = {
            left: `${primaryContainerRect.left + 48}px`,
            width: `${primaryContainerRect.width - 96}px`,
            top: `${(window.scrollY + (primaryContainerRect.height / 2)) - (popupRect.height / 2)}px`,
        };

        return newStyle;
    }

    handleAssitedTaggingSourceChange = (newSource) => {
        this.setState({
            selectedAssitedTaggingSource: newSource,
        }, () => this.refreshSelections());
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
            api.selectEntry(existing.data.id);
        } else {
            api.getEntryBuilder()
                .setExcerpt(text)
                .apply();
        }
        this.handleOnCloseAssistedActions();
    }

    handleLeadPreviewLoad = (leadPreview) => {
        if (this.nlpClassifyRequest) {
            this.nlpClassifyRequest.stop();
        }
        this.nlpClassifyRequest = this.createNlpClassifyRequest(leadPreview.classifiedDocId);
        this.nlpClassifyRequest.start();

        if (this.ceClassifyRequest) {
            this.ceClassifyRequest.stop();
        }

        this.ceClassifyRequest = this.createCeClassifyRequest(leadPreview.previewId);
        this.ceClassifyRequest.start();

        if (this.nerClassifyRequest) {
            this.nerClassifyRequest.stop();
        }

        this.nerClassifyRequest = this.createNerClassifyRequest(leadPreview.text);
        this.nerClassifyRequest.start();
    }

    createNlpClassifyRequest = (docId) => {
        const request = new FgRestBuilder()
            .url(urlForLeadClassify)
            .params(createParamsForLeadClassify({
                deeper: 1,
                doc_id: docId,
            }))
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.extractNlpClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.serverErrorText,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.connectionFailureText,
                });
            })
            .build();
        return request;
    }

    createNerClassifyRequest = (text) => {
        const request = new FgRestBuilder()
            .url(urlForNer)
            .params(createParamsForNer(text))
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.extractNerClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.serverErrorText,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.connectionFailureText,
                });
            })
            .build();
        return request;
    }

    createCeClassifyRequest = (previewId) => {
        const request = new FgRestBuilder()
            .url(createUrlForCeClassify(this.props.api.getProject().id))
            .params(createParamsForCeClassify({
                category: 'Sector',
                previewId,
            }))
            .success((response) => {
                try {
                    schema.validate(response, 'categoryEditorClassifyList');
                    this.extractCeClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.serverErrorText,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.connectionFailureText,
                });
            })
            .build();
        return request;
    }

    createFeedbackRequest = (feedback) => {
        const request = new FgRestBuilder()
            .url(urlForFeedback)
            .params(createParamsForFeedback(feedback))
            .success((response) => {
                try {
                    console.warn('feedback sent', response);

                    notify.send({
                        title: entryStrings.assitedTaggingFeedbackTitle,
                        type: notify.type.SUCCESS,
                        message: entryStrings.assitedTaggingFeedbackMessage,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.serverErrorText,
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: entryStrings.connectionFailureText,
                });
            })
            .build();
        return request;
    }

    extractNlpClassifications = (data) => {
        const classification = data.classification;
        const nlpSectorOptions = classification.map(c => ({
            key: c[0],
            label: c[0],
        }));
        const nlpSelectedSectors = nlpSectorOptions.length > 0 ?
            [nlpSectorOptions[0].key] : emptyList;

        this.nlpClassifications = data.excerpts_classification.map(excerpt => ({
            startPos: excerpt.start_pos,
            length: excerpt.end_pos - excerpt.start_pos,
            sectors: [{
                label: excerpt.classification[0][0],
                confidence: `${Math.round(excerpt.classification[0][1] * 100)}%`,
            }],
            /* excerpt.classification.filter(c => c[1] > NLP_THRESHOLD).map(c => ({
                label: c[0],
                confidence: `${Math.round(c[1] * 100)}%`,
            })) */
        })).filter(c => c.sectors.length > 0);


        this.setState({
            nlpSectorOptions,
            nlpSelectedSectors,
        }, () => this.refreshSelections());
    }

    extractNerClassifications = (data) => {
        const nerSectorOptions = [];

        if (data.length < 1) {
            return;
        }

        data.forEach((d) => {
            if (nerSectorOptions.findIndex(o => o.key === d.entity) === -1) {
                nerSectorOptions.push({
                    key: d.entity,
                    label: d.entity.charAt(0) + d.entity.slice(1).toLowerCase(),
                });
            }
        });

        this.nerClassifications = data;

        this.setState({
            nerSectorOptions,
            nerSelectedSectors: [nerSectorOptions[0].key],
        }, () => this.refreshSelections());
    }

    extractCeClassifications = (data) => {
        const classifications = data.classifications;
        const ceSectorOptions = classifications.map(c => ({
            key: c.title,
            label: c.title,
        }));

        const ceSelectedSectors = ceSectorOptions.length > 0 ?
            [ceSectorOptions[0].key] : emptyList;
        this.ceClassifications = classifications;

        this.setState({
            ceSectorOptions,
            ceSelectedSectors,
        }, () => this.refreshSelections);
    }

    refreshSelections = () => {
        const {
            selectedAssitedTaggingSource,
        } = this.state;

        if (selectedAssitedTaggingSource === 'nlp') {
            this.refreshNlpClassifications();
        } else if (selectedAssitedTaggingSource === 'ce') {
            this.refreshCeClassifications();
        } else if (selectedAssitedTaggingSource === 'ner') {
            this.refreshNerClassifications();
        }
    }

    refreshNlpClassifications = () => {
        const { nlpSelectedSectors } = this.state;
        const { nlpClassifications } = this;

        if (!nlpClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const filteredClassifications = nlpClassifications.filter(excerpt => (
            nlpSelectedSectors.reduce((acc, sector) => acc ||
                excerpt.sectors.find(s => s.label === sector), false)
        ));

        const highlights = filteredClassifications.map(excerpt => ({
            ...excerpt,
            color: getHexFromString(excerpt.sectors[0].label),
            source: entryStrings.sourceNLP,
        }));
        this.setState({ highlights });
    }

    refreshNerClassifications = () => {
        const { nerSelectedSectors } = this.state;
        const { nerClassifications } = this;

        if (!nerClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const keywords = nerClassifications.filter(c => (
            nerSelectedSectors.find(t => t === c.entity)
        )).reduce((acc, c) => acc.concat(c), []);

        const highlights = keywords.map(keyword => ({
            startPos: keyword.start,
            length: keyword.length,
            color: getHexFromString(keyword.entity),
            source: entryStrings.sourceNER,
            details: keyword.entity,
        }));
        this.setState({ highlights });
    }

    refreshCeClassifications = () => {
        const { ceSelectedSectors } = this.state;
        const { ceClassifications } = this;

        if (!ceClassifications) {
            this.setState({ highlights: emptyList });
            return;
        }

        const keywords = ceClassifications.filter(c => (
            ceSelectedSectors.find(t => t === c.title)
        )).reduce((acc, c) => acc.concat(c.keywords), []);

        const highlights = keywords.map(keyword => ({
            startPos: keyword.start,
            length: keyword.length,
            color: getHexFromString(keyword.subcategory),
            source: entryStrings.sourceCE,
            details: keyword.subcategory,
        }));
        this.setState({ highlights });
    }

    handleNerSectorSelect = (nerSelectedSectors) => {
        this.setState({ nerSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleCeSectorSelect = (ceSelectedSectors) => {
        this.setState({ ceSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleNlpSectorSelect = (nlpSelectedSectors) => {
        this.setState({ nlpSelectedSectors }, () => {
            this.refreshSelections();
        });
    }

    handleFeedbackClick = (classificationLabel, useful) => {
        const { activeHighlightDetails } = this.state;
        const feedback = {
            text: activeHighlightDetails.text,
            classification_label: classificationLabel,
            useful,
        };

        if (this.feedbackRequest) {
            this.feedbackRequest.stop();
        }
        this.feedbackRequest = this.createFeedbackRequest(feedback);
        this.feedbackRequest.start();
    }

    calcSectorKey = d => d.label;

    renderSectorList = (key, sector) => (
        <div
            key={sector.label}
            className={styles.sector}
        >
            <div className={styles['sector-text']}>
                {sector.label} {sector.confidence}
            </div>
            <div className={styles['feedback-buttons']}>
                <TransparentSuccessButton
                    title={entryStrings.accurateTextTitle}
                    onClick={() => this.handleFeedbackClick(sector.label, 'true')}
                >
                    <span className={iconNames.thumbsUp} />
                </TransparentSuccessButton>
                <TransparentWarningButton
                    title={entryStrings.notAccurateTextTitle}
                    onClick={() => this.handleFeedbackClick(sector.label, 'false')}
                >
                    <span className={iconNames.thumbsDown} />
                </TransparentWarningButton>
            </div>
        </div>
    );

    render() {
        const { lead } = this.props;
        const {
            activeHighlightDetails,
            assitedActionsVisible,
            nlpSectorOptions,
            nlpSelectedSectors,
            ceSectorOptions,
            ceSelectedSectors,
            nerSectorOptions,
            nerSelectedSectors,
            selectedAssitedTaggingSource,
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
                <div styleName="bottom-box">
                    <SegmentButton
                        styleName="assisted-source-change-btn"
                        data={this.assitedTaggingSources}
                        selected={selectedAssitedTaggingSource}
                        onChange={this.handleAssitedTaggingSourceChange}
                        backgroundHighlight
                    />
                    {
                        selectedAssitedTaggingSource === 'nlp' && (
                            <MultiSelectInput
                                label={entryStrings.showSuggestionText}
                                styleName="select-input"
                                options={nlpSectorOptions}
                                showHintAndError={false}
                                value={nlpSelectedSectors}
                                onChange={this.handleNlpSectorSelect}
                            />
                        )
                    }
                    {
                        selectedAssitedTaggingSource === 'ce' && (
                            <MultiSelectInput
                                label={entryStrings.showSuggestionText}
                                styleName="select-input"
                                options={ceSectorOptions}
                                showHintAndError={false}
                                value={ceSelectedSectors}
                                onChange={this.handleCeSectorSelect}
                            />
                        )
                    }
                    {
                        selectedAssitedTaggingSource === 'ner' && (
                            <MultiSelectInput
                                label={entryStrings.showSuggestionText}
                                styleName="select-input"
                                options={nerSectorOptions}
                                showHintAndError={false}
                                value={nerSelectedSectors}
                                onChange={this.handleNerSectorSelect}
                            />
                        )
                    }
                </div>
                {assitedActionsVisible &&
                    <FloatingContainer
                        parent={this.state.activeHighlightRef}
                        onInvalidate={this.handleAssitedBoxInvalidate}
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
                                <div>
                                    { activeHighlightDetails.details &&
                                        <span styleName="details">
                                            {activeHighlightDetails.details.toLowerCase()}
                                        </span>
                                    }
                                </div>
                            </div>
                            {selectedAssitedTaggingSource === 'nlp' && (
                                <ListView
                                    styleName="sectors"
                                    modifier={this.renderSectorList}
                                    data={activeHighlightDetails.sectors}
                                    keyExtractor={this.calcSectorKey}
                                />
                            )}
                            <PrimaryButton
                                iconName={iconNames.add}
                                className={styles['add-button']}
                                onClick={() => this.handleEntryAdd(
                                    activeHighlightDetails.text,
                                )}
                            >
                                {entryStrings.addEntryButtonLabel}
                            </PrimaryButton>
                        </div>
                    </FloatingContainer>
                }
            </div>
        );
    }
}
