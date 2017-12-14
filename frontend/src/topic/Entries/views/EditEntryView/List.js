import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { GridLayout } from '../../../../public/components/View';

import styles from './styles.scss';

import widgetStore from '../../../AnalysisFramework/widgetStore';

import {
    Button,
    SuccessButton,
} from '../../../../public/components/Action';

const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line

    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);
    }

    componentWillReceiveProps(nextProps) {
        this.update(nextProps.analysisFramework);
    }

    getGridItems = () => this.items.map(item => ({
        id: item.id,
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.listGridLayout,
    }))

    getMaxHeight = () => this.items.reduce((acc, item) => (
        Math.max(acc, item.properties.listGridLayout.height + item.properties.listGridLayout.top)
    ), 0);

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).listComponent;
        return (
            <Component
                api={this.props.api}
                attribute={this.props.api.getEntryAttribute(item.id)}
            />
        );
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
                listComponent: widget.analysisFramework.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            );
        } else {
            this.items = [];
        }
    }

    render() {
        return (
            <div
                styleName="list"
            >
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
                                key={entry.data.id}
                                styleName="entry"
                                style={{ height: this.getMaxHeight() + 16 }}
                            >
                                <GridLayout
                                    styleName="grid-layout"
                                    modifier={this.getItemView}
                                    items={this.getGridItems()}
                                    viewOnly
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
