import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import { FgRestBuilder } from '../../../../public/utils/rest';
import { CoordinatorBuilder } from '../../../../public/utils/coordinate';
import update from '../../../../public/utils/immutable-update';
import { LoadingAnimation } from '../../../../public/components/View';
import { randomString } from '../../../../public/utils/common';

import {
    leadIdFromRoute,
    editEntryViewCurrentAnalysisFrameworkSelector,
    editEntryViewEntriesSelector,
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
} from '../../../../common/redux';
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
} from '../../../../common/rest';
import {
    notificationStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';
import schema from '../../../../common/schema';

import {
    ENTRY_STATUS,
    entryAccessor,
    calcEntryState,
    calcEntriesDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '../../../../common/entities/entry';

import styles from './styles.scss';
import API from './API';
import Overview from './Overview';
import List from './List';

const propTypes = {
    leadId: PropTypes.string.isRequired,
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
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
};

const defaultProps = {
    analysisFramework: undefined,
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    analysisFramework: editEntryViewCurrentAnalysisFrameworkSelector(state, props),
    entries: editEntryViewEntriesSelector(state, props),
    selectedEntryId: editEntryViewSelectedEntryIdSelector(state, props),
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
});


@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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
            pendingProjectAndAf: true,

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

        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }

        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }

        this.saveRequestCoordinator.close();
    }

    createRequestForLead = (leadId) => {
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLead(leadId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'lead');
                    this.props.setLead({ lead: response });

                    const {
                        id,
                        project,
                    } = response;

                    // Load project
                    this.projectRequest = this.createRequestForProject(project);
                    this.projectRequest.start();

                    // Load entries
                    // NOTE: could be loaded along with lead
                    this.entriesRequest = this.createRequestForEntriesOfLead(id);
                    this.entriesRequest.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return leadRequest;
    }

    createRequestForProject = (projectId) => {
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
                    );
                    this.analysisFramework.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(createUrlForAnalysisFramework(analysisFrameworkId))
            .params(() => createParamsForUser())
            .delay(0)
            .postLoad(() => {
                this.setState({ pendingProjectAndAf: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForEntriesOfLead = (leadId) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForEntriesOfLead(leadId))
            .params(() => createParamsForEntriesOfLead())
            .postLoad(() => {
                this.setState({ pendingEntries: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
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
                        title: notificationStrings.entryUpdate,
                        message: notificationStrings.entryUpdateOverridden,
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
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
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                const uiState = { error: true };
                this.props.changeEntry({ leadId, entryId, uiState });
                this.saveRequestCoordinator.notifyComplete(entryId);
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

    handleDeleteEntry = (markOrUnmark) => {
        const {
            leadId,
            selectedEntryId,
        } = this.props;

        this.props.markForDeleteEntry({
            leadId,
            entryId: selectedEntryId,
            mark: markOrUnmark,
        });
    }

    handleChangeEntryValues = (entryId, values, pristine) => {
        this.props.changeEntry({
            leadId: this.props.leadId,
            entryId,
            values,
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
            selectedEntryId,
        } = this.props;
        const {
            pendingSaveAll,
            pendingEntries,
            pendingProjectAndAf,
        } = this.state;

        if (pendingEntries || pendingProjectAndAf) {
            return (
                <div styleName="edit-entry">
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


        return (
            <HashRouter>
                <div styleName="edit-entry">
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
                                analysisFramework={analysisFramework}
                                onSaveAll={this.handleSaveAll}
                                onEntryAdd={this.handleAddEntry}
                                onEntryDelete={this.handleDeleteEntry}

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
                                entries={entries}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
