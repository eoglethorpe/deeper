import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getColorOnBgColor } from '../../../../public/utils/common';

import Button from '../../../../public/components/Action/Button';
import DangerButton from '../../../../public/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import SuccessButton from '../../../../public/components/Action/Button/SuccessButton';
import ListView from '../../../../public/components/View/List/ListView';
import ListItem from '../../../../public/components/View/List/ListItem';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import ResizableH from '../../../../public/components/View/Resizable/ResizableH';
import SelectInput from '../../../../public/components/Input/SelectInput';
import GridLayout from '../../../../public/components/View/GridLayout';

import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import ImagesGrid from '../../../../common/components/ImagesGrid';
import {
    InternalGallery,
    ExternalGallery,
} from '../../../../common/components/DeepGallery';
import {
    setActiveEntryAction,
    editEntryViewCurrentLeadSelector,
    entryStringsSelector,
    afStringsSelector,
} from '../../../../common/redux';
import {
    LEAD_TYPE,
    LEAD_PANE_TYPE,
    leadPaneTypeMap,
} from '../../../../common/entities/lead';
import { iconNames } from '../../../../common/constants';
import { entryAccessor, ENTRY_STATUS } from '../../../../common/entities/entry';

import widgetStore from '../../../AnalysisFramework/widgetStore';

import AssistedTagging from '../AssistedTagging';
import styles from './styles.scss';

const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setActiveEntry: PropTypes.func.isRequired,

    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    saveAllDisabled: PropTypes.bool.isRequired,
    saveAllPending: PropTypes.bool.isRequired,
    widgetDisabled: PropTypes.bool,

    onEntryAdd: PropTypes.func.isRequired,
    onEntryDelete: PropTypes.func.isRequired,
    onSaveAll: PropTypes.func.isRequired,

    entryStrings: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
};

const mapStateToProps = (state, props) => ({
    lead: editEntryViewCurrentLeadSelector(state, props),
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
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

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);

        this.state = {
            currentEntryId: undefined,
            images: emptyList,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
            this.updateGridItems(nextProps.entries);
        }

        if (
            this.props.entries !== nextProps.entries ||
            this.props.selectedEntryId !== nextProps.selectedEntryId
        ) {
            this.updateGridItems();
        }

        if (this.props.saveAllPending !== nextProps.saveAllPending) {
            if (nextProps.saveAllPending && this.state.currentTab !== 'entries-listing') {
                this.setState({
                    currentTab: 'entries-listing',
                    oldTab: this.state.currentTab,
                });
            } else if (!nextProps.saveAllPending && this.state.currentTab === 'entries-listing') {
                this.setState({
                    currentTab: this.state.oldTab,
                    oldTab: undefined,
                });
            }
        }
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: this.props.afStrings(widget.title),
                overviewComponent: widget.tagging.overviewComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            ).map((item) => {
                const filters = analysisFramework.filters.filter(f => f.widgetKey === item.key);
                const exportable = analysisFramework.exportables.find(
                    e => e.widgetKey === item.key,
                );

                return {
                    ...item,
                    filters,
                    exportable,
                };
            });
        } else {
            this.items = [];
        }
    }

    updateGridItems() {
        this.gridItems = this.items.map(item => ({
            id: item.id,
            key: item.key,
            widgetId: item.widgetId,
            filters: item.filters,
            exportable: item.exportable,
            title: item.title,
            layout: item.properties.overviewGridLayout,
            data: item.properties.data,
            attribute: this.props.api.getEntryAttribute(item.id),
        }));
    }

    handleEntryItemClick = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
        // NOTE: change to last selected on click
        // this.setState({ currentTab: this.state.oldTab });
    }

    handleEntrySelectChange = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
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

    handleLoadImages = (response) => {
        if (response.images) {
            this.setState({ images: response.images });
        }
    }

    calcEntryKey = entry => entryAccessor.getKey(entry);

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

    calcEntryLabelLimited = (entry) => {
        const values = entryAccessor.getValues(entry);
        if (values.entryType === 'image') {
            return this.props.entryStrings('imageLabel');
        }
        const characterLimit = 64;
        const text = values.excerpt;

        if (!text) {
            return this.props.entryStrings('excerptLabel');
        }

        const limitedEntry = text.slice(0, characterLimit);
        if (text.length > characterLimit) {
            return `${limitedEntry}...`;
        }
        return limitedEntry;
    }

    isTypeWithUrl = t => t === LEAD_TYPE.website;

    isTypeWithAttachment = t => (
        [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_TYPE.drive].indexOf(t) !== 1
    );

    handleScreenshot = (image) => {
        this.props.api.getEntryBuilder()
            .setImage(image)
            .apply();
    }

    renderHighlightSimplifiedExcerpt = (highlight, text) => (
        <span
            style={{
                backgroundColor: highlight.color,
                color: getColorOnBgColor(highlight.color),
            }}
        >
            {text}
        </span>
    );

    renderEntriesList = (key, entry) => {
        const {
            selectedEntryId,
            entries,
            onEntryDelete,
        } = this.props;

        const currentEntryId = this.calcEntryKey(entry);
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

    renderLeadPreview = (lead) => {
        const { sourceType: type } = lead;

        if (this.isTypeWithUrl(type) && lead.url) {
            return (
                <ExternalGallery
                    styleName="preview"
                    url={lead.url}
                    onScreenshotCapture={this.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        } else if (this.isTypeWithAttachment(type) && lead.attachment) {
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

    renderItemView = (item) => {
        const widget = this.widgets.find(
            w => w.id === item.widgetId,
        );
        const OverviewComponent = widget.overviewComponent;

        return (
            <OverviewComponent
                entryId={this.props.selectedEntryId}
                id={item.id}
                filters={item.filters}
                exportable={item.exportable}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    renderLeft = ({
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

        return (
            <Tabs
                name="leftPaneTabs"
                selectedTab={currentTab}
                handleSelect={this.handleTabSelect}
                activeLinkStyle={{ none: 'none' }}
                styleName="tabs-container"
            >
                <div styleName="tabs-header-container">
                    { showSimplified &&
                        <TabLink
                            styleName="tab-header"
                            to="simplified-preview"
                        >
                            {labelSimplified}
                        </TabLink>
                    }
                    { showAssisted &&
                        <TabLink
                            styleName="tab-header"
                            to="assisted-tagging"
                        >
                            {labelAssisted}
                        </TabLink>
                    }
                    { showOriginal &&
                        <TabLink
                            styleName="tab-header"
                            to="original-preview"
                        >
                            {labelOriginal}
                        </TabLink>
                    }
                    {
                        images.length > 0 &&
                            <TabLink
                                styleName="tab-header"
                                to="images-preview"
                            >
                                {this.props.entryStrings('imagesTabLabel')}
                            </TabLink>
                    }
                    <TabLink
                        styleName="tab-header"
                        to="entries-listing"
                    >
                        {this.props.entryStrings('entriesTabLabel')}
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div styleName="tabs-content">
                    { showSimplified &&
                        <TabContent
                            styleName="tab"
                            for="simplified-preview"
                        >
                            <SimplifiedLeadPreview
                                styleName="simplified-preview"
                                leadId={lead.id}
                                highlights={api.getEntryHighlights()}
                                highlightModifier={this.renderHighlightSimplifiedExcerpt}
                                onLoad={this.handleLoadImages}
                            />
                        </TabContent>
                    }
                    { showAssisted &&
                        <TabContent
                            styleName="tab"
                            for="assisted-tagging"
                        >
                            <AssistedTagging
                                styleName="assisted-tagging"
                                lead={lead}
                                api={api}
                            />
                        </TabContent>
                    }
                    { showOriginal &&
                        <TabContent
                            styleName="tab"
                            for="original-preview"
                        >
                            <div styleName="original-preview">
                                {this.renderLeadPreview(lead)}
                            </div>
                        </TabContent>
                    }
                    {
                        images.length > 0 &&
                            <TabContent
                                styleName="tab"
                                for="images-preview"
                            >
                                <ImagesGrid
                                    styleName="images-preview"
                                    images={this.state.images}
                                />
                            </TabContent>
                    }
                    <TabContent
                        styleName="tab"
                        for="entries-listing"
                    >
                        <div styleName="entries-list-container">
                            <ListView
                                styleName="entries-list"
                                modifier={this.renderEntriesList}
                                data={entries}
                                keyExtractor={this.calcEntryKey}
                            />
                        </div>
                    </TabContent>
                </div>
            </Tabs>
        );
    }

    renderLeftPanel = () => {
        const { lead } = this.props;

        const leadPaneType = Overview.getPaneType(lead);
        switch (leadPaneType) {
            case LEAD_PANE_TYPE.spreadsheet:
                // tabular(original) entries
                return this.renderLeft({
                    labelOriginal: 'Tabular', // FIXME: use strings
                    showSimplified: false,
                    showAssisted: false,
                });
            case LEAD_PANE_TYPE.image:
                return this.renderLeft({
                    labelOriginal: this.props.entryStrings('imagesTabLabel'),
                    showSimplified: false,
                    showAssisted: false,
                });
            case LEAD_PANE_TYPE.text:
                return this.renderLeft({
                    labelSimplified: 'Text', // FIXME: use strings
                    showOriginal: false,
                });
            case LEAD_PANE_TYPE.word:
            case LEAD_PANE_TYPE.pdf:
            case LEAD_PANE_TYPE.presentation:
            case LEAD_PANE_TYPE.website:
                return this.renderLeft({});
            default:
                // FIXME: use strings
                return (
                    <p>
                        There seems to be some error with lead.
                    </p>
                );
        }
    }

    render() {
        const {
            selectedEntryId,
            entries,
            filteredEntries,
            onSaveAll,
            saveAllDisabled,
            widgetDisabled,
            onEntryAdd,
            onEntryDelete,
        } = this.props;

        const selectedEntry = entries.find(
            e => entryAccessor.getKey(e) === selectedEntryId,
        );
        const isMarkedForDelete = selectedEntryId && entryAccessor.isMarkedForDelete(selectedEntry);

        return (
            <ResizableH
                styleName="overview"
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
                leftChild={this.renderLeftPanel()}
                rightChild={[
                    <header
                        key="header"
                        styleName="header"
                    >
                        <div styleName="entry-actions">
                            <SelectInput
                                styleName="select-input"
                                placeholder={this.props.entryStrings('selectExcerptPlaceholder')}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                                keySelector={this.calcEntryKey}
                                labelSelector={this.calcEntryLabelLimited}
                                options={filteredEntries}
                                value={selectedEntryId}
                                onChange={this.handleEntrySelectChange}
                            />
                            <PrimaryButton
                                title={this.props.entryStrings('addEntryButtonTitle')}
                                onClick={onEntryAdd}
                            >
                                <i className={iconNames.add} />
                            </PrimaryButton>
                            { selectedEntry && !isMarkedForDelete &&
                                <DangerButton
                                    title={this.props.entryStrings('removeEntryButtonTitle')}
                                    onClick={() => onEntryDelete(true)}
                                >
                                    <i className={iconNames.delete} />
                                </DangerButton>
                            }
                        </div>
                        <div styleName="action-buttons">
                            <Link
                                styleName="goto-link"
                                to="/list"
                                replace
                            >
                                {this.props.entryStrings('gotoListButtonLabel')}
                            </Link>
                            <SuccessButton
                                styleName="save-button"
                                onClick={onSaveAll}
                                disabled={saveAllDisabled}
                            >
                                {this.props.entryStrings('saveButtonLabel')}
                            </SuccessButton>
                        </div>
                    </header>,
                    <div
                        key="container"
                        ref={(el) => { this.gridLayoutContainer = el; }}
                        styleName="container"
                    >
                        { widgetDisabled && <LoadingAnimation /> }
                        <GridLayout
                            styleName="grid-layout"
                            modifier={this.renderItemView}
                            items={this.gridItems}
                            viewOnly
                        />
                    </div>,
                ]}
            />
        );
    }
}
