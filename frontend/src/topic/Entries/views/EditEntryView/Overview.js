import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import { connect } from 'react-redux';

import {
    Button,
    DangerButton,
    PrimaryButton,
    SuccessButton,
    TransparentButton,
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
} from '../../../../common/constants';
import {
    setActiveEntryAction,
    editEntryViewCurrentLeadSelector,
} from '../../../../common/redux';

import widgetStore from '../../../AnalysisFramework/widgetStore';
import WebsiteViewer from '../../../../common/components/WebsiteViewer';
import DeepGallery from '../../../../common/components/DeepGallery';
import AssistedTagging from '../AssistedTagging';

import { LEAD_TYPE } from '../../../../common/entities/lead';
import { entryAccessor, ENTRY_STATUS } from '../../../../common/entities/entry';
import SimplifiedLeadPreview from '../../../../common/components/SimplifiedLeadPreview';
import styles from './styles.scss';

const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line

    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    lead: PropTypes.object, // eslint-disable-line
    setActiveEntry: PropTypes.func.isRequired,

    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    choices: PropTypes.object.isRequired, // eslint-disable-line

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

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.updateItems(props.analysisFramework);

        this.state = {
            entriesListViewShow: false,
            currentEntryId: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateItems(nextProps.analysisFramework);
        }
    }

    getGridItems = () => this.items.map(item => ({
        id: item.id,
        key: item.key,
        widgetId: item.widgetId,
        filterId: item.filterId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
        data: item.properties.data,
        attribute: this.props.api.getEntryAttribute(item.id),
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;
        return (
            <Component
                id={item.id}
                filterId={item.filterId}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    updateItems(analysisFramework) {
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
                const filter = analysisFramework.filters.find(f => f.key === item.key);
                return {
                    ...item,
                    filterId: filter && filter.id,
                };
            });
        } else {
            this.items = [];
        }
    }

    handleGotoListButtonClick = () => {
        window.location.hash = '/list/';
    }

    handleEntriesListToggleClick = () => {
        this.setState({ entriesListViewShow: !this.state.entriesListViewShow });
    }

    handleEntrySelectChange = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
    }

    calcStyleNameWithState = (style) => {
        const { entriesListViewShow } = this.state;
        const styleNames = [style];

        if (entriesListViewShow || this.props.saveAllPending) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    calcEntryKey = entry => entryAccessor.getKey(entry);

    calcEntryLabel = entry => entryAccessor.getValues(entry).excerpt;

    calcEntryLabelLimited = (entry) => {
        const characterLimit = 32;
        const text = entryAccessor.getValues(entry).excerpt;
        const limitedEntry = text.slice(0, characterLimit);
        if (text.length > characterLimit) {
            return `${limitedEntry}...`;
        }
        return limitedEntry;
    }

    highlightSimplifiedExcerpt = (highlight, text) => (
        <span style={{ backgroundColor: highlight.color }}>
            {text}
        </span>
    );

    renderEntriesList = (key, entry) => {
        const { selectedEntryId } = this.props;

        const currentEntryId = this.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const status = this.props.choices[key].choice;

        return (
            <ListItem
                className="entries-list-item"
                key={key}
                active={isActive}
                scrollIntoView={isActive}
            >
                <button
                    className="button"
                    onClick={() => this.handleEntrySelectChange(currentEntryId)}
                >
                    <div className="entry-excerpt">
                        {this.calcEntryLabel(entry)}
                    </div>
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
        const type = lead.sourceType;

        if (type === LEAD_TYPE.website) {
            if (lead.url) {
                return (
                    <div styleName="lead-preview">
                        <WebsiteViewer styleName="gallery-file" url={lead.url} />
                    </div>
                );
            }
            return (
                <div styleName="lead-preview">
                    <div styleName="preview-text">
                        <h1>Preview Not Available</h1>
                    </div>
                </div>
            );
        } else if (type === LEAD_TYPE.text) {
            return undefined;
        }

        return (
            <div styleName="lead-preview">
                {
                    lead.attachment ? (
                        <DeepGallery
                            styleName="gallery-file"
                            galleryId={lead.attachment}
                        />
                    ) :
                        <div styleName="preview-text">
                            <h1>Preview Not Available</h1>
                        </div>
                }
            </div>
        );
    }

    renderSimplifiedLeadPreview = lead => (
        <SimplifiedLeadPreview
            leadId={lead.id}
            highlights={this.props.api.getEntryHighlights()}
            highlightModifier={this.highlightSimplifiedExcerpt}
        />
    )

    renderLeftSection = lead => (
        <Tabs
            activeLinkStyle={{ none: 'none' }}
            styleName="tabs-container"
        >
            <div styleName="tabs-header-container">
                <TabLink
                    styleName="tab-header"
                    to="simplified-preview"
                >
                    Simplified
                </TabLink>
                <TabLink
                    styleName="tab-header"
                    to="assisted-tagging"
                >
                    Assisted
                </TabLink>
                <TabLink
                    styleName="tab-header"
                    to="original-preview"
                >
                    Original
                </TabLink>
                {/* Essential for border bottom, for more info contact AdityaKhatri */}
                <div styleName="empty-tab" />
            </div>
            <div styleName="tabs-content">
                <TabContent
                    styleName="tab"
                    for="simplified-preview"
                >
                    {this.renderSimplifiedLeadPreview(lead)}
                </TabContent>
                <TabContent
                    styleName="tab"
                    for="original-preview"
                >
                    {this.renderLeadPreview(lead)}
                </TabContent>
                <TabContent
                    styleName="tab"
                    for="assisted-tagging"
                >
                    <AssistedTagging
                        lead={lead}
                        api={this.props.api}
                    />
                </TabContent>
            </div>
        </Tabs>
    )

    render() {
        const {
            selectedEntryId,
            entries,
            lead,

            onSaveAll,

            saveAllDisabled,
            widgetDisabled,
        } = this.props;

        const entry = this.props.entries.find(e => entryAccessor.getKey(e) === selectedEntryId);
        const isMarkedForDelete = entry && entryAccessor.isMarkedForDelete(entry);

        return (
            <div styleName="overview">
                <div styleName="left">
                    <header styleName="header">
                        <TransparentButton
                            title="List entries"
                            iconName={iconNames.list}
                            styleName={this.calcStyleNameWithState('entries-list-btn')}
                            onClick={this.handleEntriesListToggleClick}
                        >
                            List Entries
                        </TransparentButton>
                    </header>
                    <div styleName="container">
                        {this.renderLeftSection(lead)}
                        <div
                            styleName={this.calcStyleNameWithState('entries-list-container')}
                        >
                            <ListView
                                styleName="entries-list"
                                modifier={this.renderEntriesList}
                                data={entries}
                                keyExtractor={this.calcEntryKey}
                            />
                        </div>
                    </div>
                </div>
                <div styleName="right">
                    <header styleName="header">
                        <div styleName="entry-actions">
                            <SelectInput
                                styleName="select-input"
                                placeholder="Select an excerpt"
                                showHintAndError={false}
                                showLabel={false}
                                clearable={false}
                                keySelector={this.calcEntryKey}
                                labelSelector={this.calcEntryLabelLimited}
                                options={entries}
                                value={selectedEntryId}
                                onChange={this.handleEntrySelectChange}
                            />
                            <PrimaryButton
                                title="Add entry"
                                onClick={this.props.onEntryAdd}
                            >
                                Add
                            </PrimaryButton>
                            { entry && !isMarkedForDelete &&
                                <DangerButton
                                    title="Mark current entry for removal"
                                    onClick={() => this.props.onEntryDelete(true)}
                                >
                                    Remove
                                </DangerButton>
                            }
                            { entry && isMarkedForDelete &&
                                <Button
                                    title="Unmark current entry for removal"
                                    onClick={() => this.props.onEntryDelete(false)}
                                >
                                    Undo Remove
                                </Button>
                            }
                        </div>
                        <div styleName="action-buttons">
                            <Button
                                onClick={this.handleGotoListButtonClick}
                            >
                                Goto list
                            </Button>
                            <SuccessButton
                                styleName="save-button"
                                onClick={onSaveAll}
                                disabled={saveAllDisabled}
                            >
                                Save
                            </SuccessButton>
                        </div>
                    </header>
                    <div styleName="container">
                        <div
                            ref={(el) => { this.gridLayoutContainer = el; }}
                            styleName="right"
                        >
                            { widgetDisabled && <LoadingAnimation /> }
                            <GridLayout
                                styleName="grid-layout"
                                modifier={this.getItemView}
                                items={this.getGridItems()}
                                viewOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
