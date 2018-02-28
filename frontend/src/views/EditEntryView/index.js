import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
    Prompt,
} from 'react-router-dom';

import { CoordinatorBuilder } from '../../vendor/react-store/utils/coordinate';
import { randomString } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    leadIdFromRoute,
    editEntryViewCurrentAnalysisFrameworkSelector,
    editEntryViewEntriesSelector,
    editEntryViewFilteredEntriesSelector,
    editEntryViewSelectedEntryIdSelector,

    setAnalysisFrameworkAction,
    setEditEntryViewLeadAction,
    setProjectAction,

    saveEntryAction,
    changeEntryAction,
    diffEntriesAction,

    addEntryAction,
    removeEntryAction,
    markForDeleteEntryAction,
    setActiveEntryAction,
    removeAllEntriesAction,

    routeUrlSelector,
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
};

const defaultProps = {
    analysisFramework: undefined,
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    analysisFramework: editEntryViewCurrentAnalysisFrameworkSelector(state, props),
    entries: editEntryViewEntriesSelector(state, props),
    filteredEntries: editEntryViewFilteredEntriesSelector(state, props),
    selectedEntryId: editEntryViewSelectedEntryIdSelector(state, props),
    routeUrl: routeUrlSelector(state),

    notificationStrings: notificationStringsSelector(state),
    commonStrings: commonStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    saveEntry: params => dispatch(saveEntryAction(params)),
    changeEntry: params => dispatch(changeEntryAction(params)),

    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryViewLeadAction(params)),
    setProject: params => dispatch(setProjectAction(params)),

    diffEntries: params => dispatch(diffEntriesAction(params)),
    addEntry: params => dispatch(addEntryAction(params)),
    removeEntry: params => dispatch(removeEntryAction(params)),
    markForDeleteEntry: params => dispatch(markForDeleteEntryAction(params)),
    setActiveEntry: params => dispatch(setActiveEntryAction(params)),
    removeAllEntries: params => dispatch(removeAllEntriesAction(params)),
});


@connect(mapStateToProps, mapDispatchToProps)
export default class EditEntryView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

            pendingSaveAll: false,
        };

        this.saveRequestCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ pendingSaveAll: true });
            })
            .postSession((totalErrors) => {
                // console.warn(totalErrors);
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
    }

    componentWillMount() {
        const request = new LeadRequest(
            this,
            {
                api: this.api,
                setLead: this.props.setLead,
                startProjectRequest: this.startProjectRequest,
            },
        );
        this.leadRequest = request.create(this.props.leadId);
        this.leadRequest.start();
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

        this.saveRequestCoordinator.stop();
    }

    startProjectRequest = (project, leadId) => {
        const request = new ProjectRequest(
            this,
            {
                api: this.api,
                setProject: this.props.setProject,
                startAfRequest: this.startAfRequest,
            },
        );
        this.projectRequest = request.create(project, leadId);
        this.projectRequest.start();
    }

    startAfRequest = (analysisFramework, leadId) => {
        const request = new AfRequest(
            this,
            {
                api: this.api,
                getAf: () => this.props.analysisFramework,
                removeAllEntries: this.props.removeAllEntries,
                setAnalysisFramework: this.props.setAnalysisFramework,
                startEntriesRequest: this.startEntriesRequest,
            },
        );
        this.analysisFrameworkRequest = request.create(analysisFramework, leadId);
        this.analysisFrameworkRequest.start();
    }

    startEntriesRequest = (leadId) => {
        const request = new EntriesRequest(
            this,
            {
                api: this.api,
                getEntries: () => this.props.entries,
                diffEntries: this.props.diffEntries,
                notificationStrings: this.props.notificationStrings,
            },
        );
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
                const deleteEntryRequest = new DeleteEntryRequest(
                    this,
                    {
                        api: this.api,
                        removeEntry: this.props.removeEntry,
                        getCoordinator: () => this.saveRequestCoordinator,
                        getChoices: () => this.choices,
                    },
                );
                request = deleteEntryRequest.create(leadId, entry);
            } else {
                const saveEntryRequest = new SaveEntryRequest(
                    this,
                    {
                        api: this.api,
                        changeEntry: this.props.changeEntry,
                        saveEntry: this.props.saveEntry,
                        getChoices: () => this.choices,
                        getCoordinator: () => this.saveRequestCoordinator,
                        getLeadId: () => this.props.leadId,
                        getEntries: () => this.props.entries,
                    },
                );
                request = saveEntryRequest.create(id);
            }
            this.saveRequestCoordinator.add(id, request);
        });
        this.saveRequestCoordinator.start();
    }

    calcChoices = () => {
        const { entries } = this.props;
        const {
            entryRests,
            entryDeleteRests,
        } = this.state;

        return entries.reduce(
            (acc, entry) => {
                const entryId = entryAccessor.getKey(entry);
                const choice = calcEntryState({
                    entry,
                    rest: entryRests[entryId],
                    deleteRest: entryDeleteRests[entryId],
                });
                const isSaveDisabled = (choice !== ENTRY_STATUS.nonPristine);
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

    render() {
        const {
            analysisFramework,
            leadId,
            entries,
            filteredEntries,
            selectedEntryId,
        } = this.props;
        const {
            pendingSaveAll,
            pendingEntries,
            pendingAf,
        } = this.state;

        if (pendingEntries || pendingAf) {
            return (
                <div className={styles['edit-entry']} >
                    <LoadingAnimation />
                </div>
            );
        }

        this.api.setEntries(entries);
        this.api.setSelectedId(selectedEntryId);

        // calculate all choices
        this.choices = this.calcChoices();
        const { isWidgetDisabled } = this.choices[selectedEntryId] || {};
        const someSaveEnabled = Object.keys(this.choices).some(
            key => !(this.choices[key].isSaveDisabled),
        );
        const isSaveAllDisabled = pendingSaveAll || !someSaveEnabled;

        return ([
            <Prompt
                key="prompt"
                when={!isSaveAllDisabled}
                message={
                    location => (
                        location.pathname === this.props.routeUrl ? (
                            true
                        ) : (
                            this.props.commonStrings('youHaveUnsavedChanges')
                        )
                    )
                }
            />,
            <HashRouter key="router">
                <div className={styles['edit-entry']}>
                    <Route
                        exact
                        path="/"
                        component={() => <Redirect to="/overview" />}
                    />
                    <Route
                        path="/overview"
                        render={props => (
                            <Overview
                                {...props}
                                api={this.api}
                                leadId={leadId}
                                selectedEntryId={selectedEntryId}
                                entries={entries}
                                filteredEntries={filteredEntries}
                                analysisFramework={analysisFramework}
                                onSaveAll={this.handleSaveAll}
                                onEntryAdd={this.handleAddEntry}
                                onEntryDelete={this.handleEntryDelete}

                                saveAllPending={pendingSaveAll}
                                widgetDisabled={isWidgetDisabled}
                                saveAllDisabled={isSaveAllDisabled}

                                choices={this.choices}
                            />
                        )}
                    />
                    <Route
                        path="/list"
                        render={props => (
                            <List
                                {...props}
                                api={this.api}
                                leadId={leadId}
                                onSaveAll={this.handleSaveAll}
                                saveAllDisabled={isSaveAllDisabled}
                                widgetDisabled={isWidgetDisabled}
                                entries={filteredEntries}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>,
        ]);
    }
}
