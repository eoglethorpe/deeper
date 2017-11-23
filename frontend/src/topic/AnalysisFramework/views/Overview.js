import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import {
    Link,
} from 'react-router-dom';

import {
    Responsive,
} from '../../../public/components/General';

import {
    TextArea,
} from '../../../public/components/Input';

import {
    TransparentButton,
} from '../../../public/components/Action';

import {
    randomString,
} from '../../../public/utils/common';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    widgets: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        component: PropTypes.element,
    })).isRequired,
};

@Responsive
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            items: [
                {
                    key: 'a',
                    title: 'Excerpt',
                    widgetId: 'excerpt',
                    gridData: { x: 2, y: 2, w: 30, h: 20 },
                    content: (<TextArea label="Excerpt" />),
                },
            ],
        };
    }

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.state.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }

    getGridItems = () => {
        const {
            items,
        } = this.state;

        return items.map(item => (
            <div
                key={item.key}
                data-af-key={item.key}
                data-grid={item.gridData}
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
                    {item.content}
                </div>
            </div>
        ));
    }

    handleAddWidgetButtonClick = (id) => {
        const widget = this.props.widgets.find(w => w.id === id);

        const item = {
            key: this.getUniqueKey(),
            title: widget.title,
            widgetId: widget.id,
            gridData: { x: 2, y: 2, w: 30, h: 20 },
            content: widget.component,
        };

        const items = [item, ...this.state.items];
        this.setState({ items });
    }

    handleLayoutChange = (layout) => {
        setTimeout(() => {
            if (this.gridLayout) {
                const items = [...this.state.items];
                layout.forEach((itemLayout) => {
                    const key = this.gridLayout.props.children.find(
                        child => child.key === itemLayout.i,
                    ).props['data-af-key'];

                    const itemIndex = items.findIndex(i => i.key === key);
                    const item = items[itemIndex];

                    items[itemIndex] = {
                        ...item,
                        gridData: {
                            ...item.gridData,
                            y: itemLayout.y,
                            x: itemLayout.x,
                            w: itemLayout.w,
                            h: itemLayout.h,
                        },
                    };
                });

                this.setState({ items });
            }
        }, 0);
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
                            this.props.widgets.map(widget => (
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
