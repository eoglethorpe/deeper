import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import { connect } from 'react-redux';

import {
    TransparentButton,
    Button,
} from '../../../../public/components/Action';

import {
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

import styles from './styles.scss';

import widgetStore from '../../../AnalysisFramework/widgetStore';

import {
    addEntryAction,
    removeEntryAction,
    setActiveEntryAction,
} from '../../../../common/redux';

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
            gridLayoutBoundingRect: {},
            currentEntryId: undefined,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.gridLayoutContainer) {
                this.setState({
                    gridLayoutBoundingRect: this.gridLayoutContainer.getBoundingClientRect(),
                });
            }
        }, 0);
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

    getGridItems = () => {
        const {
            widgets,
            items,
        } = this;

        return items.map((item) => {
            const Component = widgets.find(w => w.id === item.widgetId).component;
            return (
                <div
                    key={item.key}
                    data-af-key={item.key}
                    data-grid={item.properties.overviewGridData}
                    styleName="grid-item"
                >
                    <header
                        styleName="header"
                    >
                        <h4 styleName="heading">{item.title}</h4>
                    </header>
                    <div
                        styleName="content"
                    >
                        <Component />
                    </div>
                </div>
            );
        });
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                component: widget.tagging.overviewComponent,
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
        this.props.removeEntry({
            leadId: this.props.leadId,
            entryId: this.props.selectedEntryId,
        });
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
                    <span>Status</span>
                </button>
            </ListItem>
        );
    }

    render() {
        const {
            width,
            height,
        } = this.state.gridLayoutBoundingRect;

        const numOfRows = 100;
        const numOfColumns = 100;
        const margin = [0, 0];
        const rowHeight = parseInt((height || 0) / numOfRows, 10);

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
                            options={this.props.entries}
                            onChange={this.handleEntrySelectChange}
                            value={this.props.selectedEntryId}
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
                            disabled={!this.props.selectedEntryId}
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
                            onClick={this.props.onSaveAll}
                            disabled={this.props.saveAllDisabled}
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
                                data={this.props.entries}
                                keyExtractor={this.calcEntryKey}
                            />
                        </div>
                    </div>
                    <div
                        ref={(el) => { this.gridLayoutContainer = el; }}
                        styleName="right"
                    >
                        <ReactGridLayout
                            styleName="grid-layout"
                            cols={numOfColumns}
                            margin={margin}
                            width={width || 0}
                            rowHeight={rowHeight}
                            isResizable={false}
                            isDraggable={false}
                            compactType={null}
                        >
                            { this.getGridItems() }
                        </ReactGridLayout>
                    </div>
                </div>
            </div>
        );
    }
}
