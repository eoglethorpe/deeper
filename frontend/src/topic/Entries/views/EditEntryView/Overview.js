import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getColorOnBgColor } from '../../../../public/utils/common';

import {
    Button,
    DangerButton,
    PrimaryButton,
    SuccessButton,
} from '../../../../public/components/Action';
import {
    GridLayout,
    ListItem,
    ListView,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    SelectInput,
} from '../../../../public/components/Input';

import {
    iconNames,
    entryStrings,
} from '../../../../common/constants';
import {
    setActiveEntryAction,
    editEntryViewCurrentLeadSelector,
} from '../../../../common/redux';

import widgetStore from '../../../AnalysisFramework/widgetStore';
import WebsiteViewer from '../../../../common/components/WebsiteViewer';
import DeepGallery from '../../../../common/components/DeepGallery';
import ImagesGrid from '../../../../common/components/ImagesGrid';
import AssistedTagging from '../AssistedTagging';

import { LEAD_TYPE } from '../../../../common/entities/lead';
import { entryAccessor, ENTRY_STATUS } from '../../../../common/entities/entry';
import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
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
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    saveAllDisabled: PropTypes.bool.isRequired,
    saveAllPending: PropTypes.bool.isRequired,
    widgetDisabled: PropTypes.bool,

    onEntryAdd: PropTypes.func.isRequired,
    onEntryDelete: PropTypes.func.isRequired,
    onSaveAll: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
};

const mapStateToProps = (state, props) => ({
    lead: editEntryViewCurrentLeadSelector(state, props),
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

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);

        this.state = {
            currentEntryId: undefined,
            images: emptyList,
            currentTab: 'simplified-preview',
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
                title: widget.title,
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
                    alt={entryStrings.altLabel}
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
            return entryStrings.imageLabel;
        }
        const characterLimit = 64;
        const text = values.excerpt;

        if (!text) {
            return entryStrings.excerptLabel;
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
                        />
                    ) : (
                        <DangerButton
                            key="remove-button"
                            className="remove-button"
                            onClick={() => onEntryDelete(true, key)}
                            iconName={iconNames.delete}
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
                <WebsiteViewer
                    styleName="gallery-file"
                    url={lead.url}
                />
            );
        } else if (this.isTypeWithAttachment(type) && lead.attachment) {
            return (
                <DeepGallery
                    styleName="gallery-file"
                    galleryId={lead.attachment.id}
                />
            );
        }
        return (
            <div styleName="preview-text">
                <h1>
                    {entryStrings.previewNotAvailableText}
                </h1>
            </div>
        );
    }

    renderLeadImages = () => (
        <ImagesGrid images={this.state.images} />
    )

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

    renderLeftPanel = () => {
        const {
            entries,
            lead,
            api,
        } = this.props;

        return (
            <div styleName="left">
                <Tabs
                    name="leftPaneTabs"
                    selectedTab={this.state.currentTab}
                    handleSelect={this.handleTabSelect}
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="simplified-preview"
                        >
                            {entryStrings.simplifiedTabLabel}
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="assisted-tagging"
                        >
                            {entryStrings.assistedTabLabel}
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="original-preview"
                        >
                            {entryStrings.originalTabLabel}
                        </TabLink>
                        {
                            this.state.images.length > 0 &&
                                <TabLink
                                    styleName="tab-header"
                                    to="images-preview"
                                >
                                    {entryStrings.imagesTabLabel}
                                </TabLink>
                        }
                        <TabLink
                            styleName="tab-header"
                            to="entries-listing"
                        >
                            {entryStrings.entriesTabLabel}
                        </TabLink>
                        <div styleName="empty-tab" />
                    </div>
                    <div styleName="tabs-content">
                        <TabContent
                            styleName="tab"
                            for="simplified-preview"
                        >
                            <SimplifiedLeadPreview
                                leadId={lead.id}
                                highlights={api.getEntryHighlights()}
                                highlightModifier={this.renderHighlightSimplifiedExcerpt}
                                onLoad={this.handleLoadImages}
                            />
                        </TabContent>
                        <TabContent
                            styleName="tab"
                            for="assisted-tagging"
                        >
                            <AssistedTagging
                                lead={lead}
                                api={api}
                            />
                        </TabContent>
                        <TabContent
                            styleName="tab"
                            for="original-preview"
                        >
                            <div styleName="lead-preview">
                                {this.renderLeadPreview(lead)}
                            </div>
                        </TabContent>
                        {
                            this.state.images.length > 0 &&
                                <TabContent
                                    styleName="tab"
                                    for="images-preview"
                                >
                                    {this.renderLeadImages(lead)}
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
            </div>
        );
    }

    render() {
        const {
            selectedEntryId,
            entries,
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
            <div styleName="overview">
                { this.renderLeftPanel() }
                <div styleName="right">
                    <header styleName="header">
                        <div styleName="entry-actions">
                            <SelectInput
                                styleName="select-input"
                                placeholder={entryStrings.selectExcerptPlaceholder}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                                keySelector={this.calcEntryKey}
                                labelSelector={this.calcEntryLabelLimited}
                                options={entries}
                                value={selectedEntryId}
                                onChange={this.handleEntrySelectChange}
                            />
                            <PrimaryButton
                                title={entryStrings.addEntryButtonTitle}
                                onClick={onEntryAdd}
                            >
                                <i className={iconNames.add} />
                            </PrimaryButton>
                            { selectedEntry && !isMarkedForDelete &&
                                <DangerButton
                                    title={entryStrings.removeEntryButtonTitle}
                                    onClick={() => onEntryDelete(true)}
                                >
                                    <i className={iconNames.delete} />
                                </DangerButton>
                            }
                            { selectedEntry && isMarkedForDelete &&
                                <Button
                                    title={entryStrings.undoRemoveEntryButtonTitle}
                                    onClick={() => onEntryDelete(false)}
                                >
                                    <i className={iconNames.undo} />
                                </Button>
                            }
                        </div>
                        <div styleName="action-buttons">
                            <Link
                                styleName="goto-link"
                                to="/list"
                                replace
                            >
                                {entryStrings.gotoListButtonLabel}
                            </Link>
                            <SuccessButton
                                styleName="save-button"
                                onClick={onSaveAll}
                                disabled={saveAllDisabled}
                            >
                                {entryStrings.saveButtonLabel}
                            </SuccessButton>
                        </div>
                    </header>
                    <div
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
                    </div>
                </div>
            </div>
        );
    }
}
