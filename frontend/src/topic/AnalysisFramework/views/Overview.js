import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';

import { connect } from 'react-redux';

import { GridLayout } from '../../../public/components/View';

import {
    TransparentButton,
    TransparentDangerButton,
    Button,
    SuccessButton,
} from '../../../public/components/Action';

import {
    SelectInput,
} from '../../../public/components/Input';

import {
    iconNames,
} from '../../../common/constants';
import {
    randomString,
} from '../../../public/utils/common';

import {
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,
} from '../../../common/redux';

import widgetStore from '../widgetStore';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
    addWidget: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.update(props.analysisFramework);

        this.widgetEditActions = {};
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.update(nextProps.analysisFramework);
        }
    }

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }

    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
        minSize: this.widgets.find(w => w.id === item.widgetId).overviewMinSize,
        data: item.properties.data,
        headerRightComponent: (
            <div
                className={`${styles['action-buttons']} action-buttons`}
            >
                <TransparentButton
                    onClick={() => this.handleWidgetEditButtonClick(item.key)}
                >
                    <span className={iconNames.edit} />
                </TransparentButton>
                <TransparentDangerButton
                    onClick={() => this.handleWidgetRemoveButtonClick(item.key)}
                >
                    <span className={iconNames.close} />
                </TransparentDangerButton>
            </div>
        ),
    }))

    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;

        return (
            <Component
                title={item.title}
                widgetKey={item.key}
                data={item.data}
                editAction={(handler) => { this.widgetEditActions[item.key] = handler; }}
                onChange={(data, filters, exportable) => {
                    this.handleItemChange(item.key, data, filters, exportable);
                }}
                className={styles.component}
            />
        );
    };

    handleWidgetEditButtonClick = (id) => {
        if (this.widgetEditActions[id]) {
            (this.widgetEditActions[id])();
        }
    }

    handleWidgetRemoveButtonClick = (id) => {
        const {
            analysisFramework,
            removeWidget,
        } = this.props;

        const widgetData = {
            analysisFrameworkId: analysisFramework.id,
            widgetId: id,
        };

        removeWidget(widgetData);
    }

    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            key: `overview-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            // TODO: calculate new position appropriately
            properties: {
                overviewGridLayout: widget.overviewComponent && {
                    left: 0,
                    top: 0,
                    ...widget.overviewMinSize || { width: 200, height: 50 },
                },
                listGridLayout: widget.listComponent && {
                    left: 0,
                    top: 0,
                    ...widget.listMinSize || { width: 200, height: 50 },
                },
            },
        };

        this.props.addWidget({
            analysisFrameworkId,
            widget: item,
            filters: [],
            exportable: {},
        });
    }

    handleLayoutChange = (items) => {
        items.forEach((item) => {
            const originalItem = this.items.find(i => i.key === item.key);
            const settings = {
                properties: {
                    overviewGridLayout: { $set: item.layout },
                },
            };

            const analysisFrameworkId = this.props.analysisFramework.id;
            const widget = update(originalItem, settings);
            this.props.updateWidget({ analysisFrameworkId, widget });
        });
    }

    handleItemChange = (key, data, filters, exportable) => {
        const originalItem = this.items.find(i => i.key === key);
        const settings = {
            properties: {
                data: { $set: data },
            },
        };

        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = update(originalItem, settings);

        this.props.updateWidget({ analysisFrameworkId, widget, filters, exportable });
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
                overviewComponent: widget.analysisFramework.overviewComponent,
                listComponent: widget.analysisFramework.listComponent,
                overviewMinSize: widget.analysisFramework.overviewMinSize,
                listMinSize: widget.analysisFramework.listMinSize,
            }));

        this.items = analysisFramework.widgets.filter(
            w => this.widgets.find(w1 => w1.id === w.widgetId),
        );
    }

    render() {
        const gridItems = this.getGridItems();

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
                                            <span className={iconNames.add} />
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
                                <span className={iconNames.add} />
                            </TransparentButton>
                            <TransparentButton
                                disabled
                            >
                                <span className={iconNames.remove} />
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

                    <GridLayout
                        styleName="grid-layout"
                        modifier={this.getItemView}
                        items={gridItems}
                        onLayoutChange={this.handleLayoutChange}
                    />
                </div>
            </div>
        );
    }
}
