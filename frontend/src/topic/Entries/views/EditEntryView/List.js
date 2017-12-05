import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGridLayout from 'react-grid-layout';
import { connect } from 'react-redux';

import { pageTitles } from '../../../../common/constants';

import styles from './styles.scss';

import widgetStore from '../../../AnalysisFramework/widgetStore';

import {
    Button,
    SuccessButton,
} from '../../../../public/components/Action';

import {
    Responsive,
} from '../../../../public/components/General';

import {
    entriesForLeadSelector,
} from '../../../../common/redux';


const propTypes = {
    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    // leadId: PropTypes.oneOfType([
    //     PropTypes.number,
    //     PropTypes.string,
    // ]).isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line
};

const mapStateToProps = (state, props) => ({
    entries: entriesForLeadSelector(state, props),
});

@Responsive
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);
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
                    <div styleName="content">
                        <Component />
                    </div>
                </div>
            );
        });
    }

    handleGotoOverviewButtonClick = () => {
        window.location.hash = '/overview/';
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.listComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                component: widget.analysisFramework.listComponent,
            }));
        this.items = analysisFramework.widgets.filter(
            w => this.widgets.find(w1 => w1.id === w.widgetId),
        );
    }

    render() {
        const {
            width,
        } = this.props.boundingClientRect;

        const numOfColumns = 100;
        const margin = [0, 0];
        const rowHeight = 24;

        return (
            <div
                styleName="list"
            >
                <Helmet>
                    <title>{ `${pageTitles.editEntry} | Overview` }</title>
                </Helmet>
                <header
                    styleName="header"
                >
                    <h3>
                        LEAD_TITLE
                    </h3>
                    <div
                        styleName="action-buttons"
                    >
                        <Button
                            onClick={this.handleGotoOverviewButtonClick}
                        >
                            Goto overview
                        </Button>
                        <SuccessButton
                            onClick={this.handleSaveButtonClick}
                        >
                            Save
                        </SuccessButton>
                    </div>
                </header>
                <div
                    styleName="entry-list"
                >
                    {
                        this.props.entries.map(entry => (
                            <div
                                key={entry.id}
                                styleName="entry"
                            >
                                <ReactGridLayout
                                    isDraggable={false}
                                    isResizable={false}
                                    styleName="grid-layout"
                                    cols={numOfColumns}
                                    margin={margin}
                                    width={width || 0}
                                    rowHeight={rowHeight}
                                    compactType={null}
                                    onLayoutChange={this.handleLayoutChange}
                                >
                                    { this.getGridItems() }
                                </ReactGridLayout>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
