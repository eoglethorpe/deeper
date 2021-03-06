import PropTypes from 'prop-types';
import React from 'react';

import {
    getHexFromString,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../vendor/react-store/components/Action/Button/SuccessButton';
import WarningButton from '../../vendor/react-store/components/Action/Button/WarningButton';
import SegmentButton from '../../vendor/react-store/components/Action/SegmentButton';
import FloatingContainer from '../../vendor/react-store/components/View/FloatingContainer';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';

import {
    urlForLeadClassify,
    urlForNer,
    urlForFeedback,
    createUrlForCeClassify,
    createParamsForLeadClassify,
    createParamsForCeClassify,
    createParamsForNer,
    createParamsForFeedback,
} from '../../rest';
import { iconNames } from '../../constants';
import notify from '../../notify';
import schema from '../../schema';
import SimplifiedLeadPreview from '../SimplifiedLeadPreview';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    onEntryAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const emptyList = [];
const emptyObject = {};

// Cut off threshold for NLP classification's confidence
const NLP_THRESHOLD = 0.33;

export default class AssistedTagging extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAssistant: false,
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
            pendingNlpClassify: true,
            pendingNerClassify: true,
            pendingCeClassify: true,
        };

        this.assitedTaggingSources = [
            {
                label: _ts('entry', 'nlpLabel'),
                value: 'nlp',
            },
            {
                label: _ts('entry', 'entitiesLabel'),
                value: 'ner',
            },
            {
                label: _ts('entry', 'ceLabel'),
                value: 'ce',
            },
        ];
    }

    // FIXME: cancel requests and call anew if projectId has changed

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

    highlightSimplifiedExcerpt = (highlight, text, actualStr) => (
        SimplifiedLeadPreview.highlightModifier(
            highlight,
            text,
            actualStr,
            this.handleHighlightClick,
        )
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

    handleHighlightClick = (e, activeHighlightDetails) => {
        if (this.primaryContainer) {
            this.primaryContainerRect = this.primaryContainer.getBoundingClientRect();
        }

        this.setState({
            showAssistant: true,
            activeHighlightRef: e.target,
            activeHighlightDetails,
        });
    }

    handleOnCloseAssistedActions = () => {
        this.setState({ showAssistant: false });
    }

    handleEntryAdd = (text) => {
        if (this.props.onEntryAdd) {
            this.props.onEntryAdd(text);
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
            .params(() => createParamsForLeadClassify({
                deeper: 1,
                doc_id: docId,
            }))
            .preLoad(() => this.setState({ pendingNlpClassify: true }))
            .postLoad(() => this.setState({ pendingNlpClassify: false }))
            .success((response) => {
                // FIXME: write schema
                this.extractNlpClassifications(response);
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createNerClassifyRequest = (text) => {
        const request = new FgRestBuilder()
            .url(urlForNer)
            .params(() => createParamsForNer(text))
            .preLoad(() => this.setState({ pendingNerClassify: true }))
            .postLoad(() => this.setState({ pendingNerClassify: false }))
            .success((response) => {
                // FIXME: write schema
                this.extractNerClassifications(response);
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createCeClassifyRequest = (previewId) => {
        const request = new FgRestBuilder()
            .url(createUrlForCeClassify(this.props.projectId))
            .preLoad(() => this.setState({ pendingCeClassify: true }))
            .postLoad(() => this.setState({ pendingCeClassify: false }))
            .params(() => createParamsForCeClassify({
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
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'connectionFailureText'),
                });
                */
            })
            .build();
        return request;
    }

    createFeedbackRequest = (feedback) => {
        const request = new FgRestBuilder()
            .url(urlForFeedback)
            .params(() => createParamsForFeedback(feedback))
            .success(() => {
                try {
                    // console.warn('feedback sent', response);
                    notify.send({
                        title: _ts('entry', 'assitedTaggingFeedbackTitle'),
                        type: notify.type.SUCCESS,
                        message: _ts('entry', 'assitedTaggingFeedbackMessage'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'serverErrorText'),
                });
                */
            })
            .fatal((response) => {
                console.error(response);
                // FIXME: notify
                /*
                this.setState({
                    pending: false,
                    error: _ts('entry', 'connectionFailureText'),
                });
                */
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
        const nlpSelectedSectors = nlpSectorOptions.map(o => o.key);
        this.nlpClassifications = data.excerpts_classification.map(excerpt => ({
            start: excerpt.start_pos,
            end: excerpt.end_pos,
            label: excerpt.classification[0][0],
            sectors: [{
                label: excerpt.classification[0][0],
                confidence: `${Math.round(excerpt.classification_confidence * 100)}%`,
                confidence_value: excerpt.classification[0][1],
            }],
        })).filter(c => c.sectors.length > 0 && c.sectors[0].confidence_value > NLP_THRESHOLD);


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
            nerSelectedSectors: nerSectorOptions.map(e => e.key),
        }, () => this.refreshSelections());
    }

    extractCeClassifications = (data) => {
        const classifications = data.classifications;
        const ceSectorOptions = classifications.map(c => ({
            key: c.title,
            label: c.title,
        }));

        const ceSelectedSectors = ceSectorOptions.map(c => c.key);
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
            source: _ts('entry', 'sourceNLP'),
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
            start: keyword.start,
            end: keyword.length + keyword.start,
            label: keyword.entity,
            color: getHexFromString(keyword.entity),
            source: _ts('entry', 'sourceNER'),
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
            start: keyword.start,
            end: keyword.start + keyword.length,
            label: keyword.subcategory,
            color: getHexFromString(keyword.subcategory),
            source: _ts('entry', 'sourceCE'),
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
            <div className={styles.sectorText}>
                {sector.label} {sector.confidence}
            </div>
            <div className={styles.feedbackButtons}>
                <SuccessButton
                    title={_ts('entry', 'accurateTextTitle')}
                    onClick={() => this.handleFeedbackClick(sector.label, 'true')}
                    transparent
                >
                    <span className={iconNames.thumbsUp} />
                </SuccessButton>
                <WarningButton
                    title={_ts('entry', 'notAccurateTextTitle')}
                    onClick={() => this.handleFeedbackClick(sector.label, 'false')}
                    transparent
                >
                    <span className={iconNames.thumbsDown} />
                </WarningButton>
            </div>
        </div>
    );

    render() {
        const {
            className,
            onEntryAdd,
            leadId,
        } = this.props;

        const {
            activeHighlightDetails,
            showAssistant,
            nlpSectorOptions,
            nlpSelectedSectors,
            ceSectorOptions,
            ceSelectedSectors,
            nerSectorOptions,
            nerSelectedSectors,
            selectedAssitedTaggingSource,
            highlights,
        } = this.state;

        const classNames = [
            className,
            styles.assistedTagging,
        ];

        if (showAssistant) {
            classNames.push(styles.assistantShown);
        }

        return (
            <div
                ref={(el) => { this.primaryContainer = el; }}
                className={classNames.join(' ')}
            >
                <SimplifiedLeadPreview
                    className="preview"
                    leadId={leadId}
                    highlights={highlights}
                    highlightModifier={this.highlightSimplifiedExcerpt}
                    onLoad={this.handleLeadPreviewLoad}
                />
                <div className={`assistant-options ${styles.assistantOptions}`}>
                    <SegmentButton
                        className={styles.assistedSourceChangeBtn}
                        data={this.assitedTaggingSources}
                        selected={selectedAssitedTaggingSource}
                        onChange={this.handleAssitedTaggingSourceChange}
                        backgroundHighlight
                    />
                    {
                        selectedAssitedTaggingSource === 'nlp' && (
                            <MultiSelectInput
                                disabled={this.state.pendingNlpClassify}
                                label={_ts('entry', 'showSuggestionText')}
                                className={styles.selectInput}
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
                                disabled={this.state.pendingCeClassify}
                                label={_ts('entry', 'showSuggestionText')}
                                className={styles.selectInput}
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
                                disabled={this.state.pendingNerClassify}
                                label={_ts('entry', 'showSuggestionText')}
                                className={styles.selectInput}
                                options={nerSectorOptions}
                                showHintAndError={false}
                                value={nerSelectedSectors}
                                onChange={this.handleNerSectorSelect}
                            />
                        )
                    }
                </div>
                {showAssistant &&
                    <FloatingContainer
                        parent={this.state.activeHighlightRef}
                        onInvalidate={this.handleAssitedBoxInvalidate}
                    >
                        <div className={styles.assistant}>
                            <header className={styles.header}>
                                <div className={styles.title}>
                                    <span className={styles.label}>
                                        {_ts('entry', 'sourceText')}
                                    </span>
                                    <span className={styles.source}>
                                        {activeHighlightDetails.source}
                                    </span>
                                </div>
                                <PrimaryButton
                                    onClick={this.handleOnCloseAssistedActions}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            </header>
                            <div className={styles.infoBar}>
                                <span>
                                    {activeHighlightDetails.text}
                                </span>
                                <div>
                                    { activeHighlightDetails.details &&
                                        <span className={styles.details}>
                                            {activeHighlightDetails.details.toLowerCase()}
                                        </span>
                                    }
                                </div>
                            </div>
                            {selectedAssitedTaggingSource === 'nlp' && (
                                <ListView
                                    className={styles.sectors}
                                    modifier={this.renderSectorList}
                                    data={activeHighlightDetails.sectors}
                                    keyExtractor={this.calcSectorKey}
                                />
                            )}
                            {onEntryAdd && (
                                <PrimaryButton
                                    iconName={iconNames.add}
                                    className={styles.addButton}
                                    onClick={() => this.handleEntryAdd(
                                        activeHighlightDetails.text,
                                    )}
                                >
                                    {_ts('entry', 'addEntryButtonLabel')}
                                </PrimaryButton>
                            )}
                        </div>
                    </FloatingContainer>
                }
            </div>
        );
    }
}
