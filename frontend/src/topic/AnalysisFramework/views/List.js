import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';

import {
    Link,
} from 'react-router-dom';

import {
    TransparentButton,
} from '../../../public/components/Action';

import {
    Responsive,
} from '../../../public/components/General';

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
export default class List extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            items: [],
        };
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

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.state.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
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

    render() {
        const {
            width,
        } = this.props.boundingClientRect;

        const numOfRows = 100;
        const numOfColumns = 100;
        const margin = [0, 0];
        const rowHeight = parseInt(500 / numOfRows, 10);

        return (
            <div styleName="list">
                <div styleName="top">
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
                <div styleName="bottom">
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
                    <Link to="/overview" >
                        Go to overview
                    </Link>
                </div>
            </div>
        );
    }
}
