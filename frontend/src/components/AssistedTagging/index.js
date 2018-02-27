import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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
import MultiSelectInput from '../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';

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
import { entryStringsSelector } from '../../redux';
import { iconNames } from '../../constants';
import notify from '../../notify';
import schema from '../../schema';
import SimplifiedLeadPreview from '../SimplifiedLeadPreview';

import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onEntryAdd: PropTypes.func.isRequired,
    className: PropTypes.string,
    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const emptyList = [];
const emptyObject = {};

// Cut off threshold for NLP classification's confidence
const NLP_THRESHOLD = 0.33;

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
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
        };

        this.assitedTaggingSources = [
            {
                label: this.props.entryStrings('nlpLabel'),
                value: 'nlp',
            },
            {
                label: this.props.entryStrings('entitiesLabel'),
                value: 'ner',
            },
            {
                label: this.props.entryStrings('ceLabel'),
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
        console.warn('Umnouting AssistedTagging');

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
        SimplifiedLeadPreview.highlightModifier(
            highlight,
            text,
            e => this.handleOnHighlightClick(e, { ...highlight, text }),
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

    handleOnHighlightClick = (e, activeHighlightDetails) => {
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
                    error: this.props.entryStrings('serverErrorText'),
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: this.props.entryStrings('connectionFailureText'),
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
                    error: this.props.entryStrings('serverErrorText'),
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: this.props.entryStrings('connectionFailureText'),
                });
            })
            .build();
        return request;
    }

    createCeClassifyRequest = (previewId) => {
        const request = new FgRestBuilder()
            .url(createUrlForCeClassify(this.props.project.id))
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
                    error: this.props.entryStrings('serverErrorText'),
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: this.props.entryStrings('connectionFailureText'),
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
                        title: this.props.entryStrings('assitedTaggingFeedbackTitle'),
                        type: notify.type.SUCCESS,
                        message: this.props.entryStrings('assitedTaggingFeedbackMessage'),
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
                    error: this.props.entryStrings('serverErrorText'),
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: this.props.entryStrings('connectionFailureText'),
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
            source: this.props.entryStrings('sourceNLP'),
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
            source: this.props.entryStrings('sourceNER'),
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
            source: this.props.entryStrings('sourceCE'),
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
                <SuccessButton
                    title={this.props.entryStrings('accurateTextTitle')}
                    onClick={() => this.handleFeedbackClick(sector.label, 'true')}
                    transparent
                >
                    <span className={iconNames.thumbsUp} />
                </SuccessButton>
                <WarningButton
                    title={this.props.entryStrings('notAccurateTextTitle')}
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
            lead,
            className,
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
            styles['assisted-tagging'],
        ];

        if (showAssistant) {
            classNames.push(styles['assistant-shown']);
        }

        return (
            <div
                ref={(el) => { this.primaryContainer = el; }}
                className={classNames.join(' ')}
            >
                <SimplifiedLeadPreview
                    className="preview"
                    leadId={lead.id}
                    highlights={highlights}
                    highlightModifier={this.highlightSimplifiedExcerpt}
                    onLoad={this.handleLeadPreviewLoad}
                />
                <div
                    className="assistant-options"
                    styleName="assistant-options"
                >
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
                                label={this.props.entryStrings('showSuggestionText')}
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
                                label={this.props.entryStrings('showSuggestionText')}
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
                                label={this.props.entryStrings('showSuggestionText')}
                                styleName="select-input"
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
                        <div styleName="assistant">
                            <header styleName="header">
                                <div styleName="title">
                                    <span styleName="label">Source:</span>
                                    <span styleName="source">{activeHighlightDetails.source}</span>
                                </div>
                                <PrimaryButton
                                    onClick={this.handleOnCloseAssistedActions}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
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
                                {this.props.entryStrings('addEntryButtonLabel')}
                            </PrimaryButton>
                        </div>
                    </FloatingContainer>
                }
            </div>
        );
    }
}
