import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import {
    Link,
} from 'react-router-dom';
import {
    Responsive,
} from '../../../../public/components/General';

import { pageTitles } from '../../../../common/utils/labels';

import styles from './styles.scss';

import widgetStore from '../../../AnalysisFramework/widgetStore';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,

    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
};

@Responsive
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);
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
            <div
                styleName="overview"
            >
                <Helmet>
                    <title>{ `${pageTitles.editEntry} | Overview` }</title>
                </Helmet>
                <div
                    styleName="left"
                >
                    <Link to="/list">
                        Go to list
                    </Link>
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
