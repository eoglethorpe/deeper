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
} from '../../../../public/components/View';
import {
    randomString,
} from '../../../../public/utils/common';
import {
    SelectInput,
} from '../../../../public/components/Input';

import {
    iconNames,
} from '../../../../common/constants';
import {
    addEntryAction,
    removeEntryAction,
    setActiveEntryAction,
} from '../../../../common/redux';


/*
createUrlForDeleteEntry,
createParamsForDeleteEntry,
*/

import { ENTRY_STATUS } from './utils/constants';
import widgetStore from '../../../AnalysisFramework/widgetStore';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    addEntry: PropTypes.func.isRequired,
    setActiveEntry: PropTypes.func.isRequired,
    removeEntry: PropTypes.func.isRequired,

    selectedEntryId: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onSaveAll: PropTypes.func.isRequired,
    saveAllDisabled: PropTypes.bool.isRequired,
    choices: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    selectedEntryId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addEntry: params => dispatch(addEntryAction(params)),
    removeEntry: params => dispatch(removeEntryAction(params)),
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);

        this.state = {
            entriesListViewShow: true,
            currentEntryId: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.update(nextProps.analysisFramework);
    }

    getStyleNameWithState = (style) => {
        const { entriesListViewShow } = this.state;
        const styleNames = [style];

        if (entriesListViewShow) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;
        return <Component />;
    }

    update(analysisFramework) {
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

    handleAddEntryButtonClick = () => {
        const entryId = randomString();

        this.props.addEntry({
            leadId: this.props.leadId,
            entry: {
                id: entryId,
                serverId: undefined,
                values: {
                    excerpt: `Excerpt ${entryId.toLowerCase()}`,
                    image: undefined,
                    lead: this.props.leadId,
                    analysisFramework: this.props.analysisFramework.id,
                    attribues: [],
                    exportData: [],
                    filterData: [],
                },
            },
        });
    }

    handleEntriesListToggleClick = () => {
        this.setState({ entriesListViewShow: !this.state.entriesListViewShow });
    }

    handleRemoveEntryButtonClick = () => {
        const {
            entries,
            selectedEntryId,
        } = this.props;
        const selectedEntry = entries.find(entry => entry.data.id === selectedEntryId);
        // console.log(entries[selectedEntryId] && entries[selectedEntryId].data.serverId);
        if (selectedEntry && selectedEntry.data.serverId) {
            console.warn('TODO: Should send request');
        } else {
            this.props.removeEntry({
                leadId: this.props.leadId,
                entryId: this.props.selectedEntryId,
            });
        }
    }

    handleEntrySelectChange = (value) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId: value,
        });
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
                    <span
                        className={`${iconNames.loading} ${styles.pending}`}
                    />
                );
            case ENTRY_STATUS.invalid:
                return (
                    <span
                        className={`${iconNames.error} ${styles.error}`}
                    />
                );
            case ENTRY_STATUS.nonstale:
                return (
                    <span
                        className={`${iconNames.codeWorking} ${styles.stale}`}
                    />
                );
            case ENTRY_STATUS.complete:
                return (
                    <span
                        className={`${iconNames.checkCircle} ${styles.complete}`}
                    />
                );
            default:
                return null;
        }
    };

    render() {
        const {
            selectedEntryId,
            choices,
            entries,

            onSaveAll,
            saveAllDisabled,
        } = this.props;

        const isRemoveDisabled = !selectedEntryId || choices[selectedEntryId].isRemoveDisabled;

        return (
            <div styleName="overview">
                <header styleName="header">
                    <TransparentButton
                        title="List entries"
                        iconName={iconNames.list}
                        styleName={this.getStyleNameWithState('entries-list-btn')}
                        onClick={this.handleEntriesListToggleClick}
                    >
                        List Entries
                    </TransparentButton>
                    <div styleName="entry-actions">
                        <SelectInput
                            placeholder="Select an excerpt"
                            showHintAndError={false}
                            showLabel={false}
                            keySelector={this.calcEntryKey}
                            labelSelector={this.calcEntryLabel}
                            options={entries}
                            onChange={this.handleEntrySelectChange}
                            value={selectedEntryId}
                            clearable={false}
                        />
                        <TransparentButton
                            title="Add entry"
                            onClick={this.handleAddEntryButtonClick}
                        >
                            <span className={iconNames.add} />
                        </TransparentButton>
                        <TransparentButton
                            title="Remove current entry"
                            onClick={this.handleRemoveEntryButtonClick}
                            disabled={isRemoveDisabled}
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
                        Lead preview
                        <div
                            styleName={this.getStyleNameWithState('entries-list-container')}
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
