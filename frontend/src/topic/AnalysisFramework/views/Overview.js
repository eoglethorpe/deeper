import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import update from 'immutability-helper';

import { connect } from 'react-redux';

import {
    Link,
} from 'react-router-dom';

import {
    Responsive,
} from '../../../public/components/General';

import {
    TransparentButton,
} from '../../../public/components/Action';

import {
    randomString,
} from '../../../public/utils/common';

import {
    addAnalysisFrameworkWidget,
    updateAnalysisFrameworkWidget,
} from '../../../common/action-creators/domainData';

import widgetStore from '../widgetStore';
import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,

    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
    addWidget: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    state,
});

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAnalysisFrameworkWidget(params)),
    updateWidget: params => dispatch(updateAnalysisFrameworkWidget(params)),
});

@Responsive
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);
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
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            key: `overview-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            properties: {
                gridData: { x: 2, y: 2, w: 30, h: 20 },
            },
        };

        const analysisFrameworkId = this.props.analysisFramework.id;
        this.props.addWidget({
            analysisFrameworkId,
            widget: item,
        });
    }

    handleLayoutChange = (layout) => {
        setTimeout(() => {
            if (this.gridLayout) {
                layout.forEach((itemLayout) => {
                    const key = this.gridLayout.props.children.find(
                        child => child.key === itemLayout.i,
                    ).props['data-af-key'];

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
        } = this.props.boundingClientRect;

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
                    <footer
                        styleName="footer"
                    >
                        <Link to="/list" >
                            Go to list
                        </Link>
                    </footer>
                </div>
                <div
                    styleName="right"
                >
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