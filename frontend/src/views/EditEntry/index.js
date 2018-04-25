import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import { CoordinatorBuilder } from '../../vendor/react-store/utils/coordinate';
import { randomString } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import MultiViewContainer from '../../vendor/react-store/components/View/MultiViewContainer';

import {
    leadIdFromRoute,
    editEntryCurrentAnalysisFrameworkSelector,
    editEntryEntriesSelector,
    editEntryFilteredEntriesSelector,
    editEntrySelectedEntryIdSelector,

    setAnalysisFrameworkAction,
    setEditEntryLeadAction,
    setProjectAction,
    setGeoOptionsAction,

    saveEntryAction,
    changeEntryAction,
    diffEntriesAction,

    addEntryAction,
    removeEntryAction,
    markForDeleteEntryAction,
    setActiveEntryAction,
    removeAllEntriesAction,

    routeUrlSelector,
    entryStringsSelector,
    notificationStringsSelector,
    commonStringsSelector,
} from '../../redux';
import {
    ENTRY_STATUS,
    entryAccessor,
    calcEntryState,
} from '../../entities/entry';
import notify from '../../notify';

import LeadRequest from './requests/LeadRequest';
import ProjectRequest from './requests/ProjectRequest';
import AfRequest from './requests/AfRequest';
import EntriesRequest from './requests/EntriesRequest';
import SaveEntryRequest from './requests/SaveEntryRequest';
import DeleteEntryRequest from './requests/DeleteEntryRequest';
import GeoOptionsRequest from './requests/GeoOptionsRequest';

import API from './API';
import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedEntryId: PropTypes.string,

    setAnalysisFramework: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,

    addEntry: PropTypes.func.isRequired,
    saveEntry: PropTypes.func.isRequired,
    removeEntry: PropTypes.func.isRequired,
    changeEntry: PropTypes.func.isRequired,
    diffEntries: PropTypes.func.isRequired,
    markForDeleteEntry: PropTypes.func.isRequired,
    setActiveEntry: PropTypes.func.isRequired,
    removeAllEntries: PropTypes.func.isRequired,

    routeUrl: PropTypes.string.isRequired,

    notificationStrings: PropTypes.func.isRequired,
    commonStrings: PropTypes.func.isRequired,
    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    analysisFramework: editEntryCurrentAnalysisFrameworkSelector(state, props),
    entries: editEntryEntriesSelector(state, props),
    filteredEntries: editEntryFilteredEntriesSelector(state, props),
    selectedEntryId: editEntrySelectedEntryIdSelector(state, props),
    routeUrl: routeUrlSelector(state),

    notificationStrings: notificationStringsSelector(state),
    commonStrings: commonStringsSelector(state),
    entryStrings: entryStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    saveEntry: params => dispatch(saveEntryAction(params)),
    changeEntry: params => dispatch(changeEntryAction(params)),

    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryLeadAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),

    diffEntries: params => dispatch(diffEntriesAction(params)),
    addEntry: params => dispatch(addEntryAction(params)),
    removeEntry: params => dispatch(removeEntryAction(params)),
    markForDeleteEntry: params => dispatch(markForDeleteEntryAction(params)),
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
    removeAllEntries: params => dispatch(removeAllEntriesAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isPageLoading = (state) => {
        const {
            pendingEntries,
            pendingAf,
            pendingGeo,
        } = state;
        return pendingEntries || pendingAf || pendingGeo;
    }

    static calcChoices = (props, state) => {
        const { entries } = props;
        const {
            entryRests,
            entryDeleteRests,
        } = state;

        return entries.reduce(
            (acc, entry) => {
                const entryId = entryAccessor.getKey(entry);
                const choice = calcEntryState({
                    entry,
                    rest: entryRests[entryId],
                    deleteRest: entryDeleteRests[entryId],
                });
                // NOTE: let user try again in invalid state as well
                const isSaveDisabled = !(
                    choice === ENTRY_STATUS.nonPristine ||
                    choice === ENTRY_STATUS.invalid
                );
                const isWidgetDisabled = (choice === ENTRY_STATUS.requesting);
                acc[entryId] = {
                    choice,
                    isSaveDisabled,
                    isWidgetDisabled,
                };
                return acc;
            },
            {},
        );
    }


    constructor(props) {
        super(props);

        this.state = {
            entryRests: {
                /*
                1: { pending: true },
                */
            },
            entryDeleteRests: {
                /*
                1: { pending: true },
                */
            },

            pendingEntries: true,
            pendingAf: true,
            pendingGeo: true,

            pendingSaveAll: false,
        };

        this.saveRequestCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ pendingSaveAll: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        type: notify.type.ERROR,
                        title: this.props.notificationStrings('entrySave'),
                        message: this.props.notificationStrings('entrySaveFailure'),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        type: notify.type.SUCCESS,
                        title: this.props.notificationStrings('entrySave'),
                        message: this.props.notificationStrings('entrySaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
                this.setState({ pendingSaveAll: false });
            })
            .build();

        this.api = new API(
            this.handleAddEntryWithValues,
            this.handleSelectEntry,
            this.handleChangeEntryValues,
        );

        this.defaultHash = 'overview';
        if (!window.location.hash) {
            window.location.replace(`#/${this.defaultHash}`);
        }

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        analysisFramework={this.props.analysisFramework}
                        entries={this.props.entries}
                        filteredEntries={this.props.filteredEntries}
                        leadId={this.props.leadId}
                        onEntryAdd={this.handleAddEntry}
                        onEntryDelete={this.handleEntryDelete}
                        selectedEntryId={this.props.selectedEntryId}

                        api={this.api}
                        choices={this.choices}
                        onSaveAll={this.handleSaveAll}
                        saveAllDisabled={this.isSaveAllDisabled}
                        saveAllPending={this.state.pendingSaveAll}
                        widgetDisabled={this.isWidgetDisabled}
                    />
                ),
            },

            list: {
                component: () => (
                    <List
                        analysisFramework={this.props.analysisFramework}
                        entries={this.props.filteredEntries}
                        leadId={this.props.leadId}

                        api={this.api}
                        choices={this.choices}
                        onSaveAll={this.handleSaveAll}
                        saveAllDisabled={this.isSaveAllDisabled}
                    />
                ),
            },
        };
    }

    componentWillMount() {
        const request = new LeadRequest({
            api: this.api,
            setLead: this.props.setLead,
            startProjectRequest: this.startProjectRequest,
            setState: params => this.setState(params),
        });
        this.leadRequest = request.create(this.props.leadId);
        this.leadRequest.start();
    }

    componentWillReceiveProps() {
        if (!window.location.hash) {
            window.location.replace(`#/${this.defaultHash}`);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (EditEntry.isPageLoading(nextState)) {
            return;
        }

        const {
            entries,
            selectedEntryId,
        } = nextProps;

        const { pendingSaveAll } = nextState;

        this.api.setEntries(entries);
        this.api.setSelectedId(selectedEntryId);

        this.choices = EditEntry.calcChoices(nextProps, nextState);

        const { isWidgetDisabled } = this.choices[selectedEntryId] || {};
        const someSaveEnabled = Object.keys(this.choices).some(
            key => !(this.choices[key].isSaveDisabled),
        );

        this.isSaveAllDisabled = pendingSaveAll || !someSaveEnabled;
        this.isWidgetDisabled = isWidgetDisabled;
    }

    componentWillUnmount() {
        this.leadRequest.stop();

        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }

        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }

        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }

        this.saveRequestCoordinator.stop();
    }

    startProjectRequest = (project, leadId) => {
        const request = new ProjectRequest({
            api: this.api,
            setProject: this.props.setProject,
            startAfRequest: this.startAfRequest,
            startGeoOptionsRequest: this.startGeoOptionsRequest,
            setState: params => this.setState(params),
        });
        this.projectRequest = request.create(project, leadId);
        this.projectRequest.start();
    }

    startGeoOptionsRequest = (projectId) => {
        const request = new GeoOptionsRequest({
            setState: params => this.setState(params),
            setGeoOptions: this.props.setGeoOptions,
            entryStrings: this.props.entryStrings,
        });
        this.geoOptionsRequest = request.create(projectId);
        this.geoOptionsRequest.start();
    }

    startAfRequest = (analysisFramework, leadId) => {
        const request = new AfRequest({
            api: this.api,
            getAf: () => this.props.analysisFramework,
            removeAllEntries: this.props.removeAllEntries,
            setAnalysisFramework: this.props.setAnalysisFramework,
            startEntriesRequest: this.startEntriesRequest,
            setState: params => this.setState(params),
        });
        this.analysisFrameworkRequest = request.create(analysisFramework, leadId);
        this.analysisFrameworkRequest.start();
    }

    startEntriesRequest = (leadId) => {
        const request = new EntriesRequest({
            api: this.api,
            getEntries: () => this.props.entries,
            diffEntries: this.props.diffEntries,
            notificationStrings: this.props.notificationStrings,
            setState: params => this.setState(params),
        });
        this.entriesRequest = request.create(leadId);
        this.entriesRequest.start();
    }

    handleAddEntryWithValues = (values) => {
        const entryId = randomString();
        const { leadId, analysisFramework } = this.props;

        this.props.addEntry({
            leadId,
            entry: {
                id: entryId,
                serverId: undefined,
                values: {
                    ...values,
                    lead: leadId,
                    analysisFramework: analysisFramework.id,
                },
            },
        });
    }

    handleAddEntry = () => {
        const entryId = randomString();
        const { leadId, analysisFramework } = this.props;

        this.props.addEntry({
            leadId,
            entry: {
                id: entryId,
                serverId: undefined,
                values: {
                    entryType: 'excerpt',
                    lead: leadId,
                    analysisFramework: analysisFramework.id,
                    attributes: [],
                    exportData: [],
                    filterData: [],
                },
            },
        });
    }

    handleSelectEntry = (entryId) => {
        this.props.setActiveEntry({
            leadId: this.props.leadId,
            entryId,
        });
    }

    handleEntryDelete = (markOrUnmark, key) => {
        const {
            leadId,
            selectedEntryId,
        } = this.props;

        this.props.markForDeleteEntry({
            leadId,
            entryId: key || selectedEntryId,
            mark: markOrUnmark,
        });
    }

    handleChangeEntryValues = (entryId, values, colors, modified = true) => {
        const uiState = {};
        if (modified) {
            uiState.error = false;
            uiState.pristine = false;
        }

        this.props.changeEntry({
            leadId: this.props.leadId,
            entryId,
            values,
            colors,
            uiState,
        });
    }

    handleSaveAll = () => {
        const { leadId, entries } = this.props;
        const entryKeys = entries.map(entryAccessor.getKey);

        entryKeys.forEach((id, i) => {
            const entry = entries[i];
            const serverId = entryAccessor.getServerId(entry);
            const isMarkedForDelete = entryAccessor.isMarkedForDelete(entry);

            let request;
            if (isMarkedForDelete && !serverId) {
                const proxyRequest = {
                    start: () => {
                        this.props.removeEntry({ leadId, entryId: id });
                        this.saveRequestCoordinator.notifyComplete(id);
                    },
                    stop: () => {}, // no-op
                };
                request = proxyRequest;
            } else if (isMarkedForDelete && serverId) {
                const deleteEntryRequest = new DeleteEntryRequest({
                    api: this.api,
                    removeEntry: this.props.removeEntry,
                    getCoordinator: () => this.saveRequestCoordinator,
                    getChoices: () => this.choices,
                    setState: params => this.setState(params),
                });
                request = deleteEntryRequest.create(leadId, entry);
            } else {
                const saveEntryRequest = new SaveEntryRequest({
                    api: this.api,
                    changeEntry: this.props.changeEntry,
                    saveEntry: this.props.saveEntry,
                    getChoices: () => this.choices,
                    getCoordinator: () => this.saveRequestCoordinator,
                    getLeadId: () => this.props.leadId,
                    getEntries: () => this.props.entries,
                    setState: params => this.setState(params),
                });
                request = saveEntryRequest.create(id);
            }
            this.saveRequestCoordinator.add(id, request);
        });
        this.saveRequestCoordinator.start();
    }

    render() {
        if (EditEntry.isPageLoading(this.state)) {
            return (
                <div className={styles.editEntry} >
                    <LoadingAnimation large />
                </div>
            );
        }

        return (
            <Fragment>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (this.isSaveAllDisabled) {
                                return true;
                            }
                            return this.props.commonStrings('youHaveUnsavedChanges');
                        }
                    }
                />
                <div className={styles.editEntry}>
                    <MultiViewContainer
                        views={this.views}
                        useHash
                    />
                </div>
            </Fragment>
        );
    }
}
