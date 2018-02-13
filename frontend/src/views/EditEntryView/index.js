import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
    Prompt,
} from 'react-router-dom';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { CoordinatorBuilder } from '../../vendor/react-store/utils/coordinate';
import update from '../../vendor/react-store/utils/immutable-update';
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
    createParamsForUser,
    createUrlForAnalysisFramework,
    createUrlForLead,
    createUrlForProject,

    createParamsForEntryCreate,
    createParamsForEntryEdit,

    createUrlForEntryEdit,
    urlForEntryCreate,

    createUrlForEntriesOfLead,
    createParamsForEntriesOfLead,

    createUrlForDeleteEntry,
    createParamsForDeleteEntry,
} from '../../rest';
import {
    ENTRY_STATUS,
    entryAccessor,
    calcEntryState,
    calcEntriesDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '../../entities/entry';
import notify from '../../notify';
import schema from '../../schema';

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
            .postSession(() => {
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
        this.leadRequest = this.createRequestForLead(this.props.leadId);
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

    createRequestForLead = (leadId) => {
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLead(leadId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'lead');
                    this.props.setLead({ lead: response });
                    this.api.setLeadDate(response.publishedOn);

                    const { project } = response;

                    // Load project
                    this.projectRequest = this.createRequestForProject(project, leadId);
                    this.projectRequest.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error('Failed loading leads');
            })
            .build();
        return leadRequest;
    }

    createRequestForProject = (projectId, leadId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');

                    this.api.setProject(response);
                    this.props.setProject({
                        project: response,
                    });

                    // Load analysisFramework
                    this.analysisFramework = this.createRequestForAnalysisFramework(
                        response.analysisFramework,
                        leadId,
                    );
                    this.analysisFramework.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error('Failed loading project of lead');
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId, leadId) => {
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(createUrlForAnalysisFramework(analysisFrameworkId))
            .params(() => createParamsForUser())
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');

                    // TODO: notify that analysis frameowrk changed and history was removed
                    if (this.props.analysisFramework.versionId < response.versionId) {
                        this.props.removeAllEntries({ leadId });
                    }
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });

                    // Load entries
                    this.entriesRequest = this.createRequestForEntriesOfLead(leadId);
                    this.entriesRequest.start();

                    this.setState({ pendingAf: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error('Failed loading af of lead');
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForEntriesOfLead = (leadId) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForEntriesOfLead(leadId))
            .params(() => createParamsForEntriesOfLead())
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    this.setState({ pendingEntries: false });

                    const entries = response.results.entries;
                    const diffs = calcEntriesDiff(this.props.entries, entries);
                    if (getApplicableDiffCount(diffs) <= 0) {
                        return;
                    }
                    this.props.diffEntries({ leadId, diffs });

                    if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
                        return;
                    }
                    notify.send({
                        type: notify.type.WARNING,
                        title: this.props.notificationStrings('entryUpdate'),
                        message: this.props.notificationStrings('entryUpdateOverridden'),
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingEntries: false });
                // TODO: notify
                console.error('Failed loading entries of lead');
            })
            .build();
        return entriesRequest;
    };

    createRequestForEntrySave = (entryId) => {
        const { leadId } = this.props;
        const entry = this.props.entries.find(
            e => entryAccessor.getKey(e) === entryId,
        );

        let urlForEntry;
        let paramsForEntry;
        const serverId = entryAccessor.getServerId(entry);
        const values = entryAccessor.getValues(entry);
        if (serverId) {
            urlForEntry = createUrlForEntryEdit(serverId);
            paramsForEntry = createParamsForEntryEdit(values);
        } else {
            urlForEntry = urlForEntryCreate;
            paramsForEntry = createParamsForEntryCreate(values);
        }

        const entrySaveRequest = new FgRestBuilder()
            .url(urlForEntry)
            .params(paramsForEntry)
            .delay(0)
            .preLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [entryId]: { $auto: {
                            pending: { $set: true },
                        } },
                    };
                    const entryRests = update(state.entryRests, requestSettings);
                    return { entryRests };
                });
            })
            .postLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [entryId]: { $auto: {
                            pending: { $set: undefined },
                        } },
                    };
                    const entryRests = update(state.entryRests, requestSettings);
                    return { entryRests };
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entry');

                    const data = {
                        versionId: response.versionId,
                        serverId: response.id,
                    };
                    this.props.saveEntry({ leadId, entryId, data });
                    notify.send({
                        type: notify.type.SUCCESS,
                        title: this.props.notificationStrings('entrySave'),
                        message: this.props.notificationStrings('entrySaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                    const uiState = { error: true };
                    this.props.changeEntry({ leadId, entryId, uiState });
                }

                this.saveRequestCoordinator.notifyComplete(entryId);
            })
            .failure((response) => {
                console.warn('FAILURE:', response);
                const uiState = { error: true };
                this.props.changeEntry({ leadId, entryId, uiState });
                this.saveRequestCoordinator.notifyComplete(entryId);
                notify.send({
                    type: notify.type.ERROR,
                    title: this.props.notificationStrings('entrySave'),
                    message: this.props.notificationStrings('entrySaveFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                const uiState = { error: true };
                this.props.changeEntry({ leadId, entryId, uiState });
                this.saveRequestCoordinator.notifyComplete(entryId);
                notify.send({
                    type: notify.type.ERROR,
                    title: this.props.notificationStrings('entrySave'),
                    message: this.props.notificationStrings('entrySaveFatal'),
                    duration: notify.duration.SLOW,
                });
            })
            .build();

        // Wrap into an actor type for co-ordinator
        const adapter = {
            start: () => {
                if (this.choices[entryId].isSaveDisabled) {
                    this.saveRequestCoordinator.notifyComplete(entryId);
                } else {
                    entrySaveRequest.start();
                }
            },
            stop: entrySaveRequest.stop,
        };

        return adapter;
    };

    createRequestForEntryDelete = (leadId, entry) => {
        const serverId = entryAccessor.getServerId(entry);
        const id = entryAccessor.getKey(entry);
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForDeleteEntry(serverId))
            .params(() => createParamsForDeleteEntry())
            .delay(0)
            .preLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [id]: { $auto: {
                            pending: { $set: true },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .postLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [id]: { $auto: {
                            pending: { $set: false },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .failure((response) => {
                console.warn('FAILURE:', response);
                this.saveRequestCoordinator.notifyComplete(id);
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                this.saveRequestCoordinator.notifyComplete(id);
            })
            .success(() => {
                this.props.removeEntry({
                    leadId,
                    entryId: id,
                });
                this.saveRequestCoordinator.notifyComplete(id);
            })
            .build();
        return entriesRequest;
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
                    excerpt: `Excerpt ${(new Date()).toLocaleTimeString()}`,
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

    handleChangeEntryValues = (entryId, values, colors, pristine) => {
        this.props.changeEntry({
            leadId: this.props.leadId,
            entryId,
            values,
            colors,
            uiState: {
                pristine,
                error: false,
            },
        });
    }

    handleSaveAll = () => {
        const { leadId, entries } = this.props;
        const entryKeys = entries.map(entryAccessor.getKey);

        entryKeys.forEach((id, i) => {
            let request;
            const entry = entries[i];
            if (entryAccessor.isMarkedForDelete(entry)) {
                // If maked for delete, send delete request
                const serverId = entryAccessor.getServerId(entry);
                if (serverId) {
                    request = this.createRequestForEntryDelete(leadId, entry);
                } else {
                    // If there is no serverId, just remove from list
                    request = {
                        start: () => {
                            this.props.removeEntry({ leadId, entryId: id });
                            this.saveRequestCoordinator.notifyComplete(id);
                        },
                        stop: () => {},
                    };
                }
            } else {
                request = this.createRequestForEntrySave(id);
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
