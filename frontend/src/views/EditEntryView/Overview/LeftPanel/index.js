import CSSModules from 'react-css-modules';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Button from '../../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import ListItem from '../../../../vendor/react-store/components/View/List/ListItem';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import { getColorOnBgColor } from '../../../../vendor/react-store/utils/common';

import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '../../../../entities/lead';
import { entryAccessor, ENTRY_STATUS } from '../../../../entities/entry';
import SimplifiedLeadPreview from '../../../../components/SimplifiedLeadPreview';
import ImagesGrid from '../../../../components/ImagesGrid';
import {
    InternalGallery,
    ExternalGallery,
} from '../../../../components/DeepGallery';
import {
    entryStringsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import AssistedTagging from '../AssistedTagging';

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

    static highlightModifier = (highlight, text) => (
        <span
            style={{
                backgroundColor: highlight.color,
                color: getColorOnBgColor(highlight.color),
            }}
        >
            {text}
        </span>
    );

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            currentTab: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { currentTab, oldTab } = this.state;
        const { saveAllPending: oldSaveAllPending } = this.props;
        const { saveAllPending: newSaveAllPending } = nextProps;
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

    handleLoadImages = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    handleTabSelect = (selectedTab) => {
        if (selectedTab === this.state.currentTab) {
            return;
        }
        let oldTab;
        if (selectedTab === 'entries-listing') {
            oldTab = this.state.currentTab;
        }
        this.setState({
            oldTab,
            currentTab: selectedTab,
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

    handleScreenshot = (image) => {
        this.props.api.getEntryBuilder()
            .setImage(image)
            .apply();
    }

    renderLeadPreview = (lead) => {
        const { sourceType: type } = lead;

        if (LeftPanel.isTypeWithUrl(type) && lead.url) {
            return (
                <ExternalGallery
                    styleName="preview"
                    url={lead.url}
                    onScreenshotCapture={this.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        } else if (LeftPanel.isTypeWithAttachment(type) && lead.attachment) {
            return (
                <InternalGallery
                    styleName="preview"
                    galleryId={lead.attachment.id}
                    onScreenshotCapture={this.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        }
        return (
            <div styleName="empty-text">
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

    renderContent = ({
        showOriginal = true,
        showSimplified = true,
        showAssisted = true,
        labelSimplified = this.props.entryStrings('simplifiedTabLabel'),
        labelAssisted = this.props.entryStrings('assistedTabLabel'),
        labelOriginal = this.props.entryStrings('originalTabLabel'),
    }) => {
        const {
            lead,
            entries,
            api,
        } = this.props;
        const {
            images,
            currentTab,
        } = this.state;

        const tablinks = [];
        const tabcontents = [];
        if (showSimplified) {
            tablinks.push((
                <TabLink
                    styleName="tab-header"
                    to="simplified-preview"
                    key="simplified-preview"
                >
                    {labelSimplified}
                </TabLink>
            ));
            tabcontents.push((
                <TabContent
                    styleName="tab"
                    for="simplified-preview"
                    key="simplified-preview"
                >
                    <SimplifiedLeadPreview
                        styleName="simplified-preview"
                        leadId={lead.id}
                        highlights={api.getEntryHighlights()}
                        highlightModifier={LeftPanel.highlightModifier}
                        onLoad={this.handleLoadImages}
                    />
                </TabContent>
            ));
        }
        if (showAssisted) {
            tablinks.push((
                <TabLink
                    styleName="tab-header"
                    to="assisted-tagging"
                    key="assisted-tagging"
                >
                    {labelAssisted}
                </TabLink>
            ));
            tabcontents.push((
                <TabContent
                    styleName="tab"
                    for="assisted-tagging"
                    key="assisted-tagging"
                >
                    <AssistedTagging
                        styleName="assisted-tagging"
                        lead={lead}
                        api={api}
                    />
                </TabContent>
            ));
        }
        if (showOriginal) {
            tablinks.push((
                <TabLink
                    styleName="tab-header"
                    to="original-preview"
                    key="original-preview"
                >
                    {labelOriginal}
                </TabLink>
            ));
            tabcontents.push((
                <TabContent
                    styleName="tab"
                    for="original-preview"
                    key="original-preview"
                >
                    <div styleName="original-preview">
                        {this.renderLeadPreview(lead)}
                    </div>
                </TabContent>
            ));
        }
        if (images.length > 0) {
            tablinks.push((
                <TabLink
                    styleName="tab-header"
                    to="images-preview"
                    key="images-preview"
                >
                    {this.props.entryStrings('imagesTabLabel')}
                </TabLink>
            ));
            tabcontents.push((
                <TabContent
                    styleName="tab"
                    for="images-preview"
                    key="images-preview"
                >
                    <ImagesGrid
                        styleName="images-preview"
                        images={this.state.images}
                    />
                </TabContent>
            ));
        }
        tablinks.push((
            <TabLink
                styleName="tab-header"
                to="entries-listing"
                key="entries-listing"
            >
                {this.props.entryStrings('entriesTabLabel')}
            </TabLink>
        ));
        tabcontents.push((
            <TabContent
                styleName="tab"
                for="entries-listing"
                key="entries-listing"
            >
                <div styleName="entries-list-container">
                    <ListView
                        styleName="entries-list"
                        modifier={this.renderEntriesList}
                        data={entries}
                        keyExtractor={LeftPanel.calcEntryKey}
                    />
                </div>
            </TabContent>
        ));

        return (
            <Tabs
                name="leftPaneTabs"
                selectedTab={currentTab}
                handleSelect={this.handleTabSelect}
                activeLinkStyle={{ none: 'none' }}
                styleName="tabs-container"
            >
                <div styleName="tabs-header-container">
                    { tablinks }
                    <div styleName="empty-tab" />
                </div>
                <div styleName="tabs-content">
                    { tabcontents }
                </div>
            </Tabs>
        );
    }

    render() {
        const { lead } = this.props;

        const leadPaneType = LeftPanel.getPaneType(lead);
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.spreadsheet:
                return this.renderContent({
                    labelOriginal: this.props.entryStrings('tabularTabLabel'),
                    showSimplified: false,
                    showAssisted: false,
                });
            case LEAD_PANE_TYPE.image:
                return this.renderContent({
                    labelOriginal: this.props.entryStrings('imagesTabLabel'),
                    showSimplified: false,
                    showAssisted: false,
                });
            case LEAD_PANE_TYPE.text:
                return this.renderContent({
                    labelSimplified: this.props.entryStrings('textTabLabel'),
                    showOriginal: false,
                });
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                return this.renderContent({});
            default:
                return (
                    <p>
                        {this.props.entryStrings('unrecognizedLeadMessage')}
                    </p>
                );
        }
    }
}
