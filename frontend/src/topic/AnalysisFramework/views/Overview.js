import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import update from 'immutability-helper';

import { connect } from 'react-redux';

import {
    TransparentButton,
    Button,
    SuccessButton,
} from '../../../public/components/Action';

import {
    SelectInput,
} from '../../../public/components/Input';

import {
    randomString,
} from '../../../public/utils/common';

import {
    addAfViewWidgetAction,
    // removeAfViewWidgetAction,
    updateAfViewWidgetAction,
} from '../../../common/redux';

import widgetStore from '../widgetStore';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
    addWidget: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);

        this.state = {
            gridLayoutBoundingRect: {},
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

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
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
                        <div styleName="actions">
                            <span
                                styleName="drag-handle"
                                className="ion-arrow-move drag-handle"
                            />
                            <TransparentButton
                                styleName="close-button"
                            >
                                <span className="ion-android-close" />
                            </TransparentButton>
                        </div>
                    </header>
                    <div styleName="content">
                        <Component />
                    </div>
                </div>
            );
        });
    }

    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            analysisFramework: analysisFrameworkId,
            key: `overview-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            properties: {
                gridData: { x: 2, y: 2, w: 30, h: 20 },
            },
        };

        this.props.addWidget({
            analysisFrameworkId,
            widget: item,
        });
    }

    handleLayoutChange = (layout) => {
        setTimeout(() => {
            if (this.gridLayout) {
                layout.forEach((itemLayout) => {
                    const child = this.gridLayout.props.children.find(
                        c => c.key === itemLayout.i,
                    );

                    if (!child) {
                        return;
                    }

                    const key = child.props['data-af-key'];

                    const itemIndex = this.items.findIndex(i => i.key === key);
                    const item = this.items[itemIndex];

                    const settings = {
                        properties: {
                            gridData: { $merge: {
                                x: itemLayout.x,
                                y: itemLayout.y,
                                w: itemLayout.w,
                                h: itemLayout.h,
                            } },
                        },
                    };

                    const analysisFrameworkId = this.props.analysisFramework.id;
                    const widget = update(item, settings);
                    this.props.updateWidget({ analysisFrameworkId, widget });
                });
            }
        }, 0);
    }

    handleGotoListButtonClick = () => {
        window.location.hash = '/list/';
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.overviewComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                component: widget.analysisFramework.overviewComponent,
            }));
        this.items = analysisFramework.widgets.filter(
            w => this.widgets.find(w1 => w1.id === w.widgetId),
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
                <div
                    styleName="left"
                >
                    <header
                        styleName="header"
                    >
                        <h2>Widgets</h2>
                    </header>
                    <div
                        styleName="widget-list"
                    >
                        {
                            this.widgets.map(widget => (
                                <div
                                    styleName="widget-list-item"
                                    key={widget.id}
                                >
                                    <div
                                        styleName="title"
                                    >
                                        {widget.title}
                                    </div>
                                    <div
                                        styleName="actions"
                                    >
                                        <TransparentButton
                                            onClick={
                                                () => {
                                                    this.handleAddWidgetButtonClick(widget.id);
                                                }
                                            }
                                        >
                                            <span className="ion-plus" />
                                        </TransparentButton>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
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
                                disabled
                                showHintAndError={false}
                                showLabel={false}
                                options={[]}
                            />
                            <TransparentButton
                                disabled
                            >
                                <span className="ion-android-add" />
                            </TransparentButton>
                            <TransparentButton
                                disabled
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
                            <SuccessButton
                                onClick={this.props.onSave}
                            >
                                Save
                            </SuccessButton>
                        </div>
                    </header>
                    <ReactGridLayout
                        styleName="grid-layout"
                        cols={numOfColumns}
                        margin={margin}
                        width={width || 0}
                        rowHeight={rowHeight}
                        compactType={null}
                        onLayoutChange={this.handleLayoutChange}
                        draggableHandle=".drag-handle"
                        ref={(gridLayout) => { this.gridLayout = gridLayout; }}
                    >
                        { this.getGridItems() }
                    </ReactGridLayout>
                </div>
            </div>
        );
    }
}
