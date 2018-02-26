import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../../vendor/react-store/components/View/FixedTabs';
import Button from '../../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import ListItem from '../../../../vendor/react-store/components/View/List/ListItem';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '../../../../entities/lead';
import { entryAccessor, ENTRY_STATUS } from '../../../../entities/entry';
import SimplifiedLeadPreview from '../../../../components/SimplifiedLeadPreview';

import AssistedTagging from '../../../../components/AssistedTagging';
import ImagesGrid from '../../../../components/ImagesGrid';
import {
    InternalGallery,
    ExternalGallery,
} from '../../../../components/DeepGallery';
import {
    entryStringsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import styles from '../../styles.scss';

const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,

    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onEntryDelete: PropTypes.func.isRequired,
    setActiveEntry: PropTypes.func.isRequired,

    entryStrings: PropTypes.func.isRequired,
    saveAllPending: PropTypes.bool.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
});

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getPaneType = (lead) => {
        if (!lead) {
            return undefined;
        }
        const type = lead.sourceType;
        if (type === LEAD_TYPE.text) {
            return LEAD_PANE_TYPE.text;
        } else if (type === LEAD_TYPE.website) {
            return LEAD_PANE_TYPE.website;
        }
        if (!lead.attachment) {
            return undefined;
        }
        const mimeType = lead.attachment.mimeType;
        return leadPaneTypeMap[mimeType];
    }

    static calcEntryKey = entry => entryAccessor.getKey(entry);

    static isTypeWithUrl = t => t === LEAD_TYPE.website;

    static isTypeWithAttachment = t => (
        [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_TYPE.drive].indexOf(t) !== 1
    );

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            currentTab: undefined,
        };

        this.highlights = props.api.getEntryHighlights();
    }

    componentWillMount() {
        const LeadPreview = this.renderLeadPreview;
        this.views = {
            'simplified-preview': {
                component: () => (
                    <SimplifiedLeadPreview
                        className={styles['simplified-preview']}
                        leadId={this.props.lead.id}
                        highlights={this.props.api.getEntryHighlights()}
                        highlightModifier={LeftPanel.highlightModifier}
                        onLoad={this.handleLoadImages}
                    />
                ),
            },
            'assisted-tagging': {
                component: () => (
                    <AssistedTagging
                        className={styles['assisted-tagging']}
                        lead={this.props.lead}
                        project={this.props.api.getProject()}
                        onEntryAdd={this.handleEntryAdd}
                    />
                ),
            },
            'original-preview': {
                component: () => (
                    <div className={styles['original-preview']}>
                        <LeadPreview lead={this.props.lead} />
                    </div>
                ),
            },
            'images-preview': {
                component: () => (
                    <ImagesGrid
                        className={styles['images-preview']}
                        images={this.state.images}
                    />
                ),
            },
            'entries-listing': {
                component: () => (
                    <div className={styles['entries-list-container']}>
                        <ListView
                            className={styles['entries-list']}
                            modifier={this.renderEntriesList}
                            data={this.props.entries}
                            keyExtractor={LeftPanel.calcEntryKey}
                        />
                    </div>
                ),
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        const { currentTab, oldTab } = this.state;
        const { saveAllPending: oldSaveAllPending, entries: oldEntries } = this.props;
        const { saveAllPending: newSaveAllPending, entries: newEntries } = nextProps;

        if (oldSaveAllPending !== newSaveAllPending) {
            if (newSaveAllPending && currentTab !== 'entries-listing') {
                this.setState({
                    currentTab: 'entries-listing',
                    oldTab: currentTab,
                });
            } else if (!newSaveAllPending && currentTab === 'entries-listing') {
                this.setState({
                    currentTab: oldTab,
                    oldTab: undefined,
                });
            }
        }

        if (oldEntries !== newEntries) {
            this.highlights = nextProps.api.getEntryHighlights();
        }
    }

    calcEntryLabel = (entry) => {
        const values = entryAccessor.getValues(entry);

        if (values.entryType === 'image') {
            return (
                <img
                    className="image"
                    src={values.image}
                    alt={this.props.entryStrings('altLabel')}
                />
            );
        }
        return (
            <div className="entry-excerpt">
                {values.excerpt}
            </div>
        );
    }

    calculateTabsForLead = (lead, images) => {
        const leadPaneType = LeftPanel.getPaneType(lead);

        let tabs;
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.spreadsheet:
                tabs = {
                    'original-preview': this.props.entryStrings('tabularTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.image:
                tabs = {
                    'original-preview': this.props.entryStrings('imagesTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.text:
                tabs = {
                    'simplified-preview': this.props.entryStrings('simplifiedTabLabel'),
                    'assisted-tagging': this.props.entryStrings('assistedTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                tabs = {
                    'simplified-preview': this.props.entryStrings('simplifiedTabLabel'),
                    'assisted-tagging': this.props.entryStrings('assistedTabLabel'),
                    'original-preview': this.props.entryStrings('originalTabLabel'),
                    'images-preview': this.props.entryStrings('imagesTabLabel'),
                };
                break;
            default:
                return undefined;
        }
        if (!images || images.length <= 0) {
            tabs['images-preview'] = undefined;
        }
        tabs['entries-listing'] = this.props.entryStrings('entriesTabLabel');
        return tabs;
    }

    handleLoadImages = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    handleTabClick = (key) => {
        if (key === this.state.currentTab) {
            return;
        }

        let oldTab;
        if (key === 'entries-listing') {
            oldTab = this.state.currentTab;
        }
        this.setState({
            oldTab,
            currentTab: key,
        });
    }

    handleEntryItemClick = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
        // NOTE: change to last selected on click
        // this.setState({ currentTab: this.state.oldTab });
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
    }

    handleScreenshot = (image) => {
        this.props.api.getEntryBuilder()
            .setImage(image)
            .apply();
    }

    renderLeadPreview = ({ lead }) => {
        const { sourceType: type } = lead;

        if (LeftPanel.isTypeWithUrl(type) && lead.url) {
            return (
                <ExternalGallery
                    className={styles.preview}
                    url={lead.url}
                    onScreenshotCapture={this.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        } else if (LeftPanel.isTypeWithAttachment(type) && lead.attachment) {
            return (
                <InternalGallery
                    classname={styles.preview}
                    galleryId={lead.attachment.id}
                    onScreenshotCapture={this.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        }
        return (
            <div className={styles['empty-text']}>
                <h1>
                    {this.props.entryStrings('previewNotAvailableText')}
                </h1>
            </div>
        );
    }

    renderIcon = (status) => {
        switch (status) {
            case ENTRY_STATUS.requesting:
                return (
                    <span className={`${iconNames.loading} pending`} />
                );
            case ENTRY_STATUS.invalid:
                return (
                    <span className={`${iconNames.error} error`} />
                );
            case ENTRY_STATUS.nonPristine:
                return (
                    <span className={`${iconNames.codeWorking} pristine`} />
                );
            case ENTRY_STATUS.complete:
                return (
                    <span className={`${iconNames.checkCircle} complete`} />
                );
            default:
                return null;
        }
    }

    renderEntriesList = (key, entry) => {
        const {
            selectedEntryId,
            entries,
            onEntryDelete,
        } = this.props;

        const currentEntryId = LeftPanel.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const status = this.props.choices[key].choice;
        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === currentEntryId,
        );

        const isMarkedForDelete = entryAccessor.isMarkedForDelete(selectedEntry);
        return (
            <ListItem
                className="entries-list-item"
                key={key}
                active={isActive}
                scrollIntoView={isActive}
            >
                <button
                    className="add-entry-list-item"
                    onClick={() => this.handleEntryItemClick(currentEntryId)}
                    disabled={isMarkedForDelete}
                >
                    {this.calcEntryLabel(entry)}
                    <div className="status-icons">
                        {
                            entryAccessor.isMarkedForDelete(entry) &&
                            <span className={`${iconNames.removeCircle} error`} />
                        }
                        {
                            this.renderIcon(status)
                        }
                    </div>
                </button>
                {
                    isMarkedForDelete ? (
                        <Button
                            key="undo-button"
                            className="remove-button"
                            onClick={() => onEntryDelete(false, key)}
                            iconName={iconNames.undo}
                            title={this.props.entryStrings('removeEntryButtonTitle')}
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className="remove-button"
                            onClick={() => onEntryDelete(true, key)}
                            iconName={iconNames.delete}
                            title={this.props.entryStrings('undoRemoveEntryButtonTitle')}
                        />
                    )
                }
            </ListItem>
        );
    }

    render() {
        const { lead } = this.props;
        const { images } = this.state;
        let { currentTab } = this.state;

        const tabs = this.calculateTabsForLead(lead, images);

        if (!tabs) {
            return (
                <p>
                    {this.props.entryStrings('unrecognizedLeadMessage')}
                </p>
            );
        }

        if (!currentTab) {
            const tabKeys = Object.keys(tabs).filter(a => !!tabs[a]);
            currentTab = tabKeys.length > 0 ? Object.keys(tabs)[0] : undefined;
        }

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTab}
                    tabs={tabs}
                    onClick={this.handleTabClick}
                />
                <MultiViewContainer
                    active={currentTab}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
