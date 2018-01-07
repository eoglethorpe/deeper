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
    urlForNer,
    createUrlForCeClassify,
    createParamsForLeadClassify,
    createParamsForCeClassify,
    createParamsForNer,
} from '../../../../common/rest';

import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import styles from './styles.scss';

// const NLP_THRESHOLD = 0;

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
                label: 'NLP',
                value: 'nlp',
            },
            {
                label: 'Entities',
                value: 'ner',
            },
            {
                label: 'Category Editor',
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
                    this.extractNlpClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
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
                    this.extractNerClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
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
                    this.extractCeClassifications(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.error(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
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
        const filteredData = data.filter(d => (d[1] !== 'O'));
        filteredData.forEach((d) => {
            if (nerSectorOptions.findIndex(o => o.key === d[1]) === -1) {
                nerSectorOptions.push({
                    key: d[1],
                    label: d[1],
                });
            }
        });

        this.nerClassifications = filteredData.map(d => ({
            text: d[0],
            sector: d[1],
        }));

        this.setState({
            nerSectorOptions,
            nerSelectedSectors: [nerSectorOptions[0].key],
        });
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
            this.refreshNlpClassifications();
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
            source: 'NLP',
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
            source: 'Category Editor',
        }));
        this.setState({ highlights });
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
                    <div styleName="details">
                        <span>Show suggestions for:</span>
                        {
                            selectedAssitedTaggingSource === 'nlp' && (
                                <SelectInput
                                    styleName="select-input"
                                    options={nlpSectorOptions}
                                    showHintAndError={false}
                                    value={nlpSelectedSectors}
                                    onChange={this.handleNlpSectorSelect}
                                    multiple
                                />
                            )
                        }
                        {
                            selectedAssitedTaggingSource === 'ce' && (
                                <SelectInput
                                    styleName="select-input"
                                    options={ceSectorOptions}
                                    showHintAndError={false}
                                    value={ceSelectedSectors}
                                    onChange={this.handleCeSectorSelect}
                                    multiple
                                />
                            )
                        }
                        {
                            selectedAssitedTaggingSource === 'ner' && (
                                <SelectInput
                                    styleName="select-input"
                                    options={nerSectorOptions}
                                    showHintAndError={false}
                                    value={nerSelectedSectors}
                                    onChange={this.handleNerSectorSelect}
                                    multiple
                                />
                            )
                        }
                    </div>
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
                        <PrimaryButton
                            iconName={iconNames.add}
                            className={styles['add-button']}
                            onClick={() => this.handleEntryAdd(
                                activeHighlightDetails.text,
                            )}
                        >
                            Add
                        </PrimaryButton>
                    </div>
                </FloatingContainer>
            </div>
        );
    }
}
