import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import GridLayout from '../../../vendor/react-store/components/View/GridLayout';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import {
    randomString,
    reverseRoute,
} from '../../../vendor/react-store/utils/common';

import {
    iconNames,
    pathNames,
} from '../../../constants';
import {
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,

    activeProjectSelector,
    afStringsSelector,
} from '../../../redux';

import widgetStore from '../../../widgets';
import styles from '../styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addWidget: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

const mapStateToProps = (state, props) => ({
    projectId: activeProjectSelector(state, props),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);

        this.widgetEditActions = {};

        this.state = {
            showDeleteModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.updateAnalysisFramework(nextProps.analysisFramework);
    }

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }

    getGridItems = items => items.map((item) => {
        const {
            key,
            widgetId,
            title,
            properties: {
                listGridLayout: layout,
                data,
            },
        } = item;

        const widget = this.widgets.find(w => w.id === item.widgetId);
        const minSize = this.widgets.find(w => w.id === widgetId).listMinSize;

        const headerRightComponent = widget.overviewComponent ? (
            <div className={`${styles['action-buttons']} action-buttons`} >
                <span
                    className={`${iconNames.info} icon`}
                    title="Widget added from overview page" // FIXME: use strings
                />
            </div>
        ) : (
            <div className={`${styles['action-buttons']} action-buttons`} >
                <Button
                    transparent
                    onClick={() => this.handleWidgetEditButtonClick(key)}
                >
                    <span className={iconNames.edit} />
                </Button>

                <DangerButton
                    transparent
                    onClick={() => this.handleWidgetRemoveButtonClick(key)}
                >
                    <span className={iconNames.close} />
                </DangerButton>
            </div>
        );

        return {
            key,
            widgetId,
            title,
            minSize,
            layout,
            data,
            widget,
            headerRightComponent,
        };
    })

    getItemView = (item) => {
        const {
            widget: { listComponent },
            key: itemKey,
            title: itemTitle,
            data: itemData,
        } = item;
        const Component = listComponent;
        const onChange = (data, title) => {
            this.handleItemChange(itemKey, data, title);
        };
        const editAction = (handler) => {
            this.widgetEditActions[itemKey] = handler;
        };
        return (
            <Component
                title={itemTitle}
                widgetKey={itemKey}
                data={itemData}
                editAction={editAction}
                onChange={onChange}
                className={styles.component}
            />
        );
    }

    handleWidgetClose = (y) => {
        if (y) {
            const {
                analysisFramework,
                removeWidget,
            } = this.props;
            const {
                deleteKey: id,
            } = this.state;

            const widgetData = {
                analysisFrameworkId: analysisFramework.id,
                widgetId: id,
            };

            removeWidget(widgetData);
        }

        this.setState({
            showDeleteModal: false,
            deleteKey: undefined,
        });
    }

    handleWidgetRemoveButtonClick = (key) => {
        this.setState({
            showDeleteModal: true,
            deleteKey: key,
        });
    }

    handleWidgetEditButtonClick = (id) => {
        if (this.widgetEditActions[id]) {
            (this.widgetEditActions[id])();
        }
    }

    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            analysisFramework: analysisFrameworkId,
            key: `list-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: this.props.afStrings(widget.title),
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
        });
    }

    handleLayoutChange = (items) => {
        items.forEach((item) => {
            const originalItem = this.items.find(i => i.key === item.key);
            const settings = {
                properties: {
                    listGridLayout: { $set: item.layout },
                },
            };

            const analysisFrameworkId = this.props.analysisFramework.id;
            const widget = update(originalItem, settings);
            this.props.updateWidget({ analysisFrameworkId, widget });
        });
    }

    handleItemChange = (key, data, title) => {
        const originalItem = this.items.find(i => i.key === key);
        const settings = {
            title: { $set: title || originalItem.title },
            properties: {
                data: { $set: data },
            },
        };

        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = update(originalItem, settings);

        this.props.updateWidget({ analysisFrameworkId, widget });
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.listComponent)
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

        this.gridItems = this.getGridItems(this.items);
    }

    handleExitButtonClick = () => {
        const {
            projectId,
            mainHistory,
        } = this.props;
        const url = `${reverseRoute(pathNames.projects, { projectId })}#/analysis-framework`;
        mainHistory.push(url);
    }

    render() {
        return (
            <div styleName="list">
                <header styleName="header">
                    <h2>
                        {this.props.afStrings('analysisFramework')}
                        /
                        <small>
                            {this.props.afStrings('headerList')}
                        </small>
                    </h2>
                    <div styleName="actions">
                        <Link
                            styleName="link-to-overview"
                            to="/overview"
                            replace
                        >
                            {this.props.afStrings('gotoOverviewButtonLabel')}
                        </Link>
                        <SuccessButton onClick={this.props.onSave}>
                            {this.props.afStrings('saveButtonLabel')}
                        </SuccessButton>
                        <PrimaryButton onClick={() => this.handleExitButtonClick()}>
                            {this.props.afStrings('exitButtonLabel')}
                        </PrimaryButton>
                    </div>
                </header>
                <div styleName="content">
                    <div styleName="grid-layout-wrapper">
                        <GridLayout
                            styleName="grid-layout"
                            modifier={this.getItemView}
                            items={this.gridItems}
                            onLayoutChange={this.handleLayoutChange}
                        />
                        <Confirm
                            title="Remove widget" // FIXME: strings
                            onClose={this.handleWidgetClose}
                            show={this.state.showDeleteModal}
                        >
                            <p>
                                {this.props.afStrings('confirmDeletewWidget')}
                            </p>
                        </Confirm>
                        {/* FIXME: strings */}
                    </div>
                    <div styleName="widget-list">
                        {
                            this.widgets.map(widget => (
                                <div
                                    styleName="widget-list-item"
                                    key={widget.id}
                                >
                                    <div styleName="title">
                                        {this.props.afStrings(widget.title)}
                                    </div>
                                    <div styleName="actions">
                                        <Button
                                            transparent
                                            onClick={
                                                () => {
                                                    this.handleAddWidgetButtonClick(widget.id);
                                                }
                                            }
                                        >
                                            <span className={iconNames.add} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}
