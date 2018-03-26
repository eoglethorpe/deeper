import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import GridLayout from '../../../vendor/react-store/components/View/GridLayout';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import WarningButton from '../../../vendor/react-store/components/Action/Button/WarningButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';

import {
    createUrlForGeoOptions,
    createParamsForGeoOptionsGET,

    transformResponseErrorToFormError,
} from '../../../rest';
import {
    editEntryCurrentLeadSelector,
    projectIdFromRouteSelector,
    markForDeleteEntryAction,

    setActiveEntryAction,
    setGeoOptionsAction,
    entryStringsSelector,
    afStringsSelector,
} from '../../../redux';
import { iconNames } from '../../../constants';
import { entryAccessor } from '../../../entities/entry';
import schema from '../../../schema';
import notify from '../../../notify';

import widgetStore from '../../../widgets';
import styles from '../styles.scss';


const propTypes = {
    leadDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    entryStrings: PropTypes.func.isRequired,
    afStrings: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    setActiveEntry: PropTypes.func.isRequired,
    markForDeleteEntry: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number.isRequired,
    onSaveAll: PropTypes.func.isRequired,
    saveAllDisabled: PropTypes.bool.isRequired,
    choices: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadDetails: editEntryCurrentLeadSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
    markForDeleteEntry: params => dispatch(markForDeleteEntryAction(params)),
});

const APPLY_MODE = {
    all: 'all',
    allBelow: 'allBelow',
};

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showApplyModal: false,
            applyMode: undefined, // all or below
            applyItemId: undefined,
            applyEntryId: undefined,

            pendingGeo: true,
        };

        this.items = [];
        this.gridItems = {};
        this.entries = {};

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);
    }

    componentWillMount() {
        const { projectId } = this.props;
        this.geoOptionsRequest = this.createGeoOptionsRequest(projectId);
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
        } else if (this.props.entries !== nextProps.entries) {
            this.updateGridItems(nextProps.entries);
        }
    }

    componentWillUnmount() {
        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }
    }

    getMaxHeight = () => this.items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top + 4);
        },
        0,
    );

    getItemView = (item) => {
        // FIXME: this causes complexity to be O(n*m)
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

    handleApplyAllClick = (itemId, entryId) => {
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.all,
            applyItemId: itemId,
            applyEntryId: entryId,
        });
    }

    handleApplyAllBelowClick = (itemId, entryId) => {
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.allBelow,
            applyItemId: itemId,
            applyEntryId: entryId,
        });
    }

    handleApplyModal = (confirm) => {
        if (confirm) {
            const {
                applyItemId,
                applyEntryId,
                applyMode,
            } = this.state;
            if (applyMode === APPLY_MODE.all) {
                this.props.api.setAttributeToAll(applyItemId, applyEntryId);
            } else if (applyMode === APPLY_MODE.allBelow) {
                this.props.api.setAttributeToBelow(applyItemId, applyEntryId);
            }
        }
        this.setState({
            showApplyModal: false,
            applyMode: undefined,
            applyItemId: undefined,
            applyEntryId: undefined,
        });
    }

    // REST
    createGeoOptionsRequest = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(() => createParamsForGeoOptionsGET())
            .preLoad(() => this.setState({ pendingGeo: true }))
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.props.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                    this.setState({ pendingGeo: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: this.props.entryStrings('geoOptionsFatalMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    };

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.tagging.listComponent)
            .map(widget => ({
                id: widget.id,
                title: this.props.afStrings(widget.title),
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
        const validIds = [];
        entries.forEach((entry) => {
            const entryId = entryAccessor.getKey(entry);
            validIds.push(entryId);

            if (this.entries[entryId] === entry) {
                return;
            }
            this.entries[entryId] = entry;

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
                headerRightComponent: this.renderActionButtons(item, entryId),
            }));
        });

        Object.keys(this.entries).filter(id => validIds.indexOf(id) === -1).forEach((id) => {
            delete this.entries[id];
            delete this.gridItems[id];
        });
    }

    renderActionButtons = (item, entryId) => (
        <div className="apply-buttons">
            <AccentButton
                title={this.props.entryStrings('applyAllButtonTitle')}
                onClick={() =>
                    this.setState({
                        showApplyModal: true,
                        applyMode: APPLY_MODE.all,
                        applyItemId: item.id,
                        applyEntryId: entryId,
                    })
                }
                tabIndex="-1"
                transparent
                iconName={iconNames.applyAll}
            />
            <WarningButton
                title={this.props.entryStrings('applyAllBelowButtonTitle')}
                onClick={() =>
                    this.setState({
                        showApplyModal: true,
                        applyMode: APPLY_MODE.allBelow,
                        applyItemId: item.id,
                        applyEntryId: entryId,
                    })}
                tabIndex="-1"
                transparent
                iconName={iconNames.applyAllBelow}
            />
        </div>
    )

    renderHeader = () => {
        const {
            leadDetails,
            onSaveAll,
            saveAllDisabled,
        } = this.props;

        return (
            <header className={styles.header}>
                <h3>
                    {leadDetails.title}
                </h3>
                <div className={styles.actionButtons}>
                    <Link
                        className={styles.primaryLinkButton}
                        to="/overview"
                        replace
                    >
                        {this.props.entryStrings('gotoOverviewButtonLabel')}
                    </Link>
                    <SuccessButton
                        onClick={onSaveAll}
                        disabled={saveAllDisabled}
                        className={styles.saveButton}
                    >
                        {this.props.entryStrings('saveButtonLabel')}
                    </SuccessButton>
                </div>
            </header>
        );
    }

    renderEntry = (entry) => {
        const {
            markForDeleteEntry,
            setActiveEntry,
            leadId,
            choices,
        } = this.props;

        const entryKey = entryAccessor.getKey(entry);

        const { isWidgetDisabled } = choices[entryKey] || {};

        const handleDelete = () => {
            markForDeleteEntry({
                leadId,
                entryId: entryKey,
                mark: true,
            });
        };
        const handleEdit = () => {
            setActiveEntry({
                leadId,
                entryId: entryKey,
            });
        };

        return (
            <div
                key={entryAccessor.getKey(entry)}
                className={styles.entry}
                style={this.entryStyle}
            >
                { isWidgetDisabled && <LoadingAnimation /> }
                <GridLayout
                    className={styles.gridLayout}
                    modifier={this.getItemView}
                    items={this.gridItems[entryAccessor.getKey(entry)]}
                    viewOnly
                />
                <div className={styles.actionButtons}>
                    {/* FIXME: use strings */}
                    <DangerButton
                        onClick={handleDelete}
                        iconName={iconNames.delete}
                        title="Delete Entry"
                    />
                    {/* FIXME: use strings */}
                    <Link
                        onClick={handleEdit}
                        to="/overview"
                        replace
                        className={styles.editLink}
                        title="Edit Entry"
                    >
                        <i className={iconNames.edit} />
                    </Link>
                </div>
            </div>
        );
    }

    render() {
        const {
            entries,
            entryStrings,
        } = this.props;
        const {
            showApplyModal,
            applyMode,
        } = this.state;

        // FIXME: this is a quick fix
        const newHeight = this.getMaxHeight();
        if (!this.entryStyle || this.entryStyle.height !== newHeight) {
            this.entryStyle = { height: newHeight };
        }

        const Header = this.renderHeader;

        return (
            <div className={styles.list}>
                <Header />
                {
                    (!entries || entries.length <= 0) ? (
                        <div className={styles.noEntryWrapper}>
                            <h2>
                                {entryStrings('noEntryFound')}
                            </h2>
                        </div>
                    ) : (
                        <div className={styles.entryList}>
                            {
                                this.state.pendingGeo ? (
                                    <LoadingAnimation />
                                ) : (
                                    entries.map(this.renderEntry)
                                )
                            }
                        </div>
                    )
                }
                <Confirm
                    show={showApplyModal}
                    closeOnEscape
                    onClose={this.handleApplyModal}
                >
                    <p>
                        {
                            applyMode === APPLY_MODE.all
                                ? entryStrings('applyToAll')
                                : entryStrings('applyToAllBelow')
                        }
                    </p>
                </Confirm>
            </div>
        );
    }
}
