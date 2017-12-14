import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { connect } from 'react-redux';

import {
    TransparentButton,
    Button,
} from '../../../../public/components/Action';
import {
    GridLayout,
    ListView,
    ListItem,
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

import { ENTRY_STATUS } from './utils/constants';
import { LEAD_TYPE } from '../../../Leads/views/LeadAdd/utils/constants.js';
import widgetStore from '../../../AnalysisFramework/widgetStore';
import WebsiteViewer from '../../../../common/components/WebsiteViewer';
import DeepGallery from '../../../../common/components/DeepGallery';
import styles from './styles.scss';

const propTypes = {
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
    widgetDisabled: PropTypes.bool,
    removeDisabled: PropTypes.bool,

    onEntryAdd: PropTypes.func.isRequired,
    onEntryDelete: PropTypes.func.isRequired,
    onSaveAll: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedEntryId: undefined,
    widgetDisabled: false,
    removeDisabled: false,
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
            entriesListViewShow: true,
            currentEntryId: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateItems(nextProps.analysisFramework);
        }
    }

    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
        data: item.properties.data,
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;
        return (
            <Component
                data={item.data}
                onChange={(data) => { this.handleWidgetChange(item.key, data); }}
            />
        );
    }

    handleWidgetChange = (key, data) => {
        console.log(key, data);
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
            );
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

        if (entriesListViewShow) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    calcEntryKey = entry => entry.data.id;

    calcEntryLabel = entry => entry.widget.values.excerpt;

    renderEntriesList = (key, entry) => {
        const { selectedEntryId } = this.props;

        const currentEntryId = this.calcEntryKey(entry);
        const isActive = currentEntryId === selectedEntryId;
        const status = this.props.choices[key].choice;

        return (
            <ListItem
                key={key}
                active={isActive}
                scrollIntoView={isActive}
            >
                <button
                    className="button"
                    onClick={() => this.handleEntrySelectChange(currentEntryId)}
                >
                    {entry.widget.values.excerpt}
                    {this.renderIcon(status)}
                </button>
            </ListItem>
        );
    }

    renderIcon = (status) => {
        switch (status) {
            case ENTRY_STATUS.requesting:
                return (
                    <span className={`${iconNames.loading} ${styles.pending}`} />
                );
            case ENTRY_STATUS.invalid:
                return (
                    <span className={`${iconNames.error} ${styles.error}`} />
                );
            case ENTRY_STATUS.nonstale:
                return (
                    <span className={`${iconNames.codeWorking} ${styles.stale}`} />
                );
            case ENTRY_STATUS.complete:
                return (
                    <span className={`${iconNames.checkCircle} ${styles.complete}`} />
                );
            default:
                return null;
        }
    };

    renderLeadPreview = (lead) => {
        const type = lead.sourceType;

        if (type === LEAD_TYPE.website) {
            if (lead.url) {
                return (
                    <div className={styles['lead-preview']} >
                        <WebsiteViewer styleName="gallery-file" url={lead.url} />
                    </div>
                );
            }
            return (
                <div className={styles['lead-preview']} >
                    <div styleName="preview-text">
                        <h1>Preview Not Available</h1>
                    </div>
                </div>
            );
        } else if (type === LEAD_TYPE.text) {
            return undefined;
        }

        return (
            <div className={styles['lead-preview']} >
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

    render() {
        const {
            selectedEntryId,
            entries,
            lead,

            onSaveAll,

            saveAllDisabled,
            widgetDisabled,
            removeDisabled,
        } = this.props;

        return (
            <div styleName="overview">
                <header styleName="header">
                    <TransparentButton
                        title="List entries"
                        iconName={iconNames.list}
                        styleName={this.calcStyleNameWithState('entries-list-btn')}
                        onClick={this.handleEntriesListToggleClick}
                    >
                        List Entries
                    </TransparentButton>
                    <div styleName="entry-actions">
                        <SelectInput
                            placeholder="Select an excerpt"
                            showHintAndError={false}
                            showLabel={false}
                            clearable={false}
                            keySelector={this.calcEntryKey}
                            labelSelector={this.calcEntryLabel}
                            options={entries}
                            value={selectedEntryId}
                            onChange={this.handleEntrySelectChange}
                        />
                        <TransparentButton
                            title="Add entry"
                            onClick={this.props.onEntryAdd}
                        >
                            <span className={iconNames.add} />
                        </TransparentButton>
                        <TransparentButton
                            title="Remove current entry"
                            onClick={this.props.onEntryDelete}
                            disabled={removeDisabled}
                        >
                            <span className={iconNames.remove} />
                        </TransparentButton>
                    </div>
                    <div styleName="action-buttons">
                        <Button
                            onClick={this.handleGotoListButtonClick}
                        >
                            Goto list
                        </Button>
                        <Button
                            styleName="save-button"
                            onClick={onSaveAll}
                            disabled={saveAllDisabled}
                        >
                            Save
                        </Button>
                    </div>
                </header>
                <div styleName="container">
                    <div styleName="left">
                        {this.renderLeadPreview(lead)}
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
        );
    }
}
