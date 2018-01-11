import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import {
    GridLayout,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Button,
    SuccessButton,
} from '../../../../public/components/Action';
import {
    entryStrings,
} from '../../../../common/constants';
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

        this.items = [];
        this.gridItems = {};

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
            this.updateGridItems(nextProps.entries);
        } else if (this.props.entries !== nextProps.entries) {
            this.updateGridItems(nextProps.entries);
        }
    }

    getMaxHeight = () => this.items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top);
        },
        0,
    );

    getItemView = (item) => {
        const Component = this.widgets
            .find(w => w.id === item.widgetId).listComponent;
        return (
            <Component
                id={item.id}
                entryId={item.entryId}
                filters={item.filters}
                exportable={item.exportable}
                api={this.props.api}
                attribute={item.attribute}
                data={item.data}
            />
        );
    }

    updateAnalysisFramework(analysisFramework) {
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
                const filters = analysisFramework.filters
                    .filter(f => f.widgetKey === item.key);
                const exportable = analysisFramework.exportables.find(
                    e => e.widgetKey === item.key,
                );

                return {
                    ...item,
                    filters,
                    exportable,
                };
            });
        } else {
            this.items = [];
        }
    }

    updateGridItems(entries) {
        this.gridItems = {};
        entries.forEach((entry) => {
            const entryId = entryAccessor.getKey(entry);
            this.gridItems[entryId] = this.items.map(item => ({
                id: item.id,
                key: item.key,
                widgetId: item.widgetId,
                filters: item.filters,
                exportable: item.exportable,
                title: item.title,
                layout: item.properties.listGridLayout,
                data: item.properties.data,
                attribute: this.props.api.getEntryAttribute(item.id, entryId),
                entryId,
            }));
        });
    }

    render() {
        const {
            entries,
            onSaveAll,
            saveAllDisabled,
            widgetDisabled,
        } = this.props;

        const entryStyle = { height: this.getMaxHeight() + 16 };

        return (
            <div styleName="list">
                { widgetDisabled && <LoadingAnimation /> }
                <header styleName="header">
                    <h3>
                        *Update_Lead_Title_Here*
                    </h3>
                    <div styleName="action-buttons">
                        <Link
                            to="/overview"
                            replace
                        >
                            {entryStrings.gotoOverviewButtonLabel}
                        </Link>
                        <SuccessButton
                            onClick={onSaveAll}
                            disabled={saveAllDisabled}
                            styleName="save-button"
                        >
                            {entryStrings.saveButtonLabel}
                        </SuccessButton>
                    </div>
                </header>
                <div styleName="entry-list">
                    {
                        entries.map(entry => (
                            <div
                                key={entryAccessor.getKey(entry)}
                                styleName="entry"
                                style={entryStyle}
                            >
                                <GridLayout
                                    styleName="grid-layout"
                                    modifier={this.getItemView}
                                    items={this.gridItems[entryAccessor.getKey(entry)]}
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
