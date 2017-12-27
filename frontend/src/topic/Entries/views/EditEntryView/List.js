import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    GridLayout,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Button,
    SuccessButton,
} from '../../../../public/components/Action';

import { entryAccessor } from '../../../../common/entities/entry';
import widgetStore from '../../../AnalysisFramework/widgetStore';
import styles from './styles.scss';


const propTypes = {
    api: PropTypes.object.isRequired, // eslint-disable-line

    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onSaveAll: PropTypes.func.isRequired,
    widgetDisabled: PropTypes.bool,
    saveAllDisabled: PropTypes.bool.isRequired,
};

const defaultProps = {
    widgetDisabled: false,
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

    getGridItems = entryId => this.items.map(item => ({
        id: item.id,
        key: item.key,
        widgetId: item.widgetId,
        filters: item.filters,
        title: item.title,
        layout: item.properties.listGridLayout,
        data: item.properties.data,
        attribute: this.props.api.getEntryAttribute(item.id, entryId),
        entryId,
    }))

    getMaxHeight = () => this.items.reduce((acc, item) => (
        Math.max(acc, item.properties.listGridLayout.height + item.properties.listGridLayout.top)
    ), 0);

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).listComponent;
        return (
            <Component
                id={item.id}
                entryId={item.entryId}
                filters={item.filters}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    handleGotoOverviewButtonClick = () => {
        window.location.hash = '/overview/';
    }

    update(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.listComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                listComponent: widget.tagging.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            ).map((item) => {
                const filters = analysisFramework.filters.filter(f => f.widgetKey === item.key);
                return {
                    ...item,
                    filters,
                };
            });
        } else {
            this.items = [];
        }
    }

    render() {
        const {
            entries,
            onSaveAll,
            saveAllDisabled,
            widgetDisabled,
        } = this.props;

        return (
            <div styleName="list">
                { widgetDisabled && <LoadingAnimation /> }
                <header styleName="header">
                    <h3>
                        LEAD_TITLE
                    </h3>
                    <div styleName="action-buttons">
                        <Button
                            onClick={this.handleGotoOverviewButtonClick}
                        >
                            Goto overview
                        </Button>
                        <SuccessButton
                            onClick={onSaveAll}
                            disabled={saveAllDisabled}
                            styleName="save-button"
                        >
                            Save
                        </SuccessButton>
                    </div>
                </header>
                <div styleName="entry-list">
                    {
                        entries.map(entry => (
                            <div
                                key={entryAccessor.getKey(entry)}
                                styleName="entry"
                                style={{ height: this.getMaxHeight() + 16 }}
                            >
                                <GridLayout
                                    styleName="grid-layout"
                                    modifier={this.getItemView}
                                    items={this.getGridItems(entryAccessor.getKey(entry))}
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
