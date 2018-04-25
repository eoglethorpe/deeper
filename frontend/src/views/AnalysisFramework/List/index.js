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
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addWidget: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
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
            <span
                className={`${iconNames.info} info-icon`}
                title="Widget added from overview page" // FIXME: use strings
            />
        ) : (
            <div className="action-buttons">
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

    renderWidgetList = () => (
        <div className={styles.widgetList}>
            {
                this.widgets.map(widget => (
                    <div
                        className={styles.widgetListItem}
                        key={widget.id}
                    >
                        <div className={styles.title}>
                            {this.props.afStrings(widget.title)}
                        </div>
                        <div className={styles.actions}>
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
    )

    renderHeader = () => {
        const {
            projectId,
            analysisFramework,
        } = this.props;

        const exitUrl = `${reverseRoute(pathNames.projects, { projectId })}#/frameworks`;
        const frameworkTitle = analysisFramework.title || this.props.afStrings('analysisFramework');

        return (
            <header className={styles.header}>
                <h2 className={styles.heading}>
                    <span className={styles.title}>
                        { frameworkTitle }
                    </span>
                    <span className={styles.separator}>
                        /
                    </span>
                    <span className={styles.pageType}>
                        {this.props.afStrings('headerList')}
                    </span>
                </h2>
                <div className={styles.actions}>
                    <Link
                        className={styles.exitLink}
                        to={exitUrl}
                    >
                        {this.props.afStrings('exitButtonLabel')}
                    </Link>
                    <Link
                        className={styles.gotoOverviewLink}
                        to="#/overview"
                        replace
                    >
                        {this.props.afStrings('gotoOverviewButtonLabel')}
                    </Link>
                    <SuccessButton
                        className={styles.saveButton}
                        onClick={this.props.onSave}
                    >
                        {this.props.afStrings('saveButtonLabel')}
                    </SuccessButton>
                </div>
            </header>
        );
    }

    render() {
        const Header = this.renderHeader;
        const WidgetList = this.renderWidgetList;

        return (
            <div className={styles.list}>
                <Header />
                <div className={styles.content}>
                    <div className={styles.gridLayoutWrapper}>
                        <GridLayout
                            className={styles.gridLayout}
                            modifier={this.getItemView}
                            items={this.gridItems}
                            onLayoutChange={this.handleLayoutChange}
                        />
                    </div>
                    <WidgetList />
                </div>

                <Confirm
                    title="Remove widget" // FIXME: strings
                    onClose={this.handleWidgetClose}
                    show={this.state.showDeleteModal}
                >
                    <p>
                        {this.props.afStrings('confirmDeletewWidget')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
