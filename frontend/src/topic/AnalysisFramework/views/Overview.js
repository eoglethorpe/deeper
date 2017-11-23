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
    Table,
} from '../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
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
                    gridData: { x: 2, y: 2, w: 30, h: 20 },
                    content: (<TextArea label="Excerpt" />),
                },
                {
                    key: 'b',
                    title: 'Sectors',
                    gridData: { x: 2, y: 40, w: 40, h: 25, minW: 30, minH: 25 },
                    content: (
                        <Table
                            headers={[
                                {
                                    key: 'category',
                                    label: '',
                                },
                                {
                                    key: 'health',
                                    label: 'Health',
                                    modifier: () => (<div className="matrix-item" />),
                                },
                                {
                                    key: 'education',
                                    label: 'Education',
                                    modifier: () => (<div className="matrix-item" />),
                                },
                                {
                                    key: 'protection',
                                    label: 'Protection',
                                    modifier: () => (<div className="matrix-item" />),
                                },
                                {
                                    key: 'shelter',
                                    label: 'Shelter',
                                    modifier: () => (<div className="matrix-item" />),
                                },
                                {
                                    key: 'food',
                                    label: 'Food',
                                    modifier: () => (<div className="matrix-item" />),
                                },
                            ]}
                            data={[
                                {
                                    category: 'Scope and scale',
                                },
                                {
                                    category: 'Humanitarian conditions',
                                },
                                {
                                    category: 'Capacities and response',
                                },
                            ]}
                            keyExtractor={item => item.category}
                        />
                    ),
                },
                {
                    key: 'c',
                    title: 'Image',
                    gridData: { x: 40, y: 2, w: 20, h: 30 },
                    content: (
                        <img
                            alt="Sample widget"
                            styleName="image-widget"
                            src="https://i.imgur.com/ejDSwZW.jpg"
                        />
                    ),
                },
            ],
            widgets: [
                { id: 'text-input', title: 'Text Input' },
                { id: 'select-input', title: 'Select Input' },
                { id: 'matrix-2d', title: 'Matrix 2d' },
            ],
        };
    }

    getGridItems = () => {
        const {
            items,
        } = this.state;

        return items.map(item => (
            <div
                key={item.key}
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
        console.log('Add widget', id);
    }

    handleItemResize = (layout, oldItem, newItem) => {
        console.log(layout, oldItem, newItem);
    }

    handleItemDragStop = (e, node) => {
        console.log(e, node);
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
                            this.state.widgets.map(widget => (
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
                        onDragStop={this.handleItemDragStop}
                        onResizeStop={this.handleItemResize}
                        draggableHandle=".drag-handle"
                    >
                        { this.getGridItems() }
                    </ReactGridLayout>
                </div>
            </div>
        );
    }
}
