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
} from '../../../../common/redux';

import { ENTRY_STATUS } from './utils/constants';
import widgetStore from '../../../AnalysisFramework/widgetStore';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
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

const mapDispatchToProps = dispatch => ({
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
});

@connect(undefined, mapDispatchToProps)
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
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;
        return <Component />;
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

    render() {
        const {
            selectedEntryId,
            entries,

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
                        Lead preview
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
