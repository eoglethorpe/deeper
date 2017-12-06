import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import { connect } from 'react-redux';

import {
    TransparentButton,
    Button,
} from '../../../../public/components/Action';

import {
    randomString,
} from '../../../../public/utils/common';

import {
    SelectInput,
} from '../../../../public/components/Input';

import { pageTitles } from '../../../../common/constants';

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
                    data-grid={item.properties.gridData}
                    styleName="grid-item"
                >
                    <header
                        styleName="header"
                    >
                        <h2>{item.title}</h2>
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
            .filter(widget => widget.analysisFramework.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                component: widget.analysisFramework.overviewComponent,
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
                excerpt: `Entry ${entryId}`,
            },
        });
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
            <div
                styleName="overview"
            >
                <Helmet>
                    <title>{ `${pageTitles.editEntry} | Overview` }</title>
                </Helmet>
                <div
                    styleName="left"
                >
                    Lead preview
                </div>
                <div
                    ref={(el) => { this.gridLayoutContainer = el; }}
                    styleName="right"
                >
                    <header
                        styleName="header"
                    >
                        <div
                            styleName="entry-actions"
                        >
                            <SelectInput
                                showHintAndError={false}
                                showLabel={false}
                                keySelector={d => d.id}
                                labelSelector={d => d.excerpt}
                                options={this.props.entries}
                                onChange={this.handleEntrySelectChange}
                                value={this.props.selectedEntryId}
                            />
                            <TransparentButton
                                title="Add entry"
                                onClick={this.handleAddEntryButtonClick}
                            >
                                <span className="ion-android-add" />
                            </TransparentButton>
                            <TransparentButton
                                title="Remove current entry"
                                onClick={this.handleRemoveEntryButtonClick}
                                disabled={!this.props.selectedEntryId}
                            >
                                <span className="ion-android-remove" />
                            </TransparentButton>
                        </div>
                        <div
                            styleName="action-buttons"
                        >
                            <Button
                                onClick={this.handleGotoListButtonClick}
                            >
                                Goto list
                            </Button>
                            <Button
                                styleName="save-button"
                                disabled
                            >
                                Save
                            </Button>
                        </div>
                    </header>
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
        );
    }
}
