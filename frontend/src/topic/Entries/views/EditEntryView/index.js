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
import schema from '../../../../common/schema';

import { ENTRY_STATUS } from './utils/constants';
import { calcEntryState, calcEntriesDiff } from './utils/entryState';

import styles from './styles.scss';
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
                    const entries = response.results;
                    const diffs = calcEntriesDiff(this.props.entries, entries);
                    this.props.diffEntries({ leadId, diffs });
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
            e => this.entryKeyExtractor(e) === entryId,
        );

        let urlForEntry;
        let paramsForEntry;
        const { serverId } = entry.data;
        if (serverId) {
            urlForEntry = createUrlForEntryEdit(serverId);
            paramsForEntry = createParamsForEntryEdit(entry.widget.values);
        } else {
            urlForEntry = urlForEntryCreate;
            paramsForEntry = createParamsForEntryCreate(entry.widget.values);
        }

        const entrySaveRequest = new FgRestBuilder()
            .url(urlForEntry)
            .params(paramsForEntry)
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

        const interceptor = {
            start: () => {
                if (this.choices[entryId].isSaveDisabled) {
                    this.saveRequestCoordinator.notifyComplete(entryId);
                } else {
                    entrySaveRequest.start();
                }
            },
            stop: entrySaveRequest.stop,
        };

        return interceptor;
    };

    createRequestForEntryDelete = (leadId, entry) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForDeleteEntry(entry.data.serverId))
            .params(() => createParamsForDeleteEntry())
            .preLoad(() => {
                console.warn('Pending', entry.data.id);
                this.setState((state) => {
                    const requestSettings = {
                        [entry.data.id]: { $auto: {
                            pending: { $set: true },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .postLoad(() => {
                console.warn('Not pending', entry.data.id);
                this.setState((state) => {
                    const requestSettings = {
                        [entry.data.id]: { $auto: {
                            pending: { $set: false },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .success(() => {
                console.warn('Removing', entry.data.id);
                this.props.removeEntry({
                    leadId,
                    entryId: entry.data.id,
                });
            })
            .build();
        return entriesRequest;
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
                    excerpt: `Excerpt ${entryId.toUpperCase()}`,
                    image: undefined,
                    lead: leadId,
                    analysisFramework: analysisFramework.id,
                    attribues: [],
                    exportData: [],
                    filterData: [],
                },
            },
        });
    }

    handleDeleteEntry = () => {
        const {
            leadId,
            selectedEntryId,
            entries,
        } = this.props;

        const selectedEntry = entries.find(entry => entry.data.id === selectedEntryId);

        // If lead has serverId then deletion must be done in the server
        if (selectedEntry && selectedEntry.data.serverId) {
            // TODO: cleanup delete rest call
            this.entryDeleteRequest = this.createRequestForEntryDelete(leadId, selectedEntry);
            this.entryDeleteRequest.start();
        } else {
            this.props.removeEntry({
                leadId,
                entryId: selectedEntryId,
            });
        }
    }

    handleSaveAll = () => {
        const entryKeys = this.props.entries
            .map(this.entryKeyExtractor);
        entryKeys.forEach((id) => {
            const request = this.createRequestForEntrySave(id);
            this.saveRequestCoordinator.add(id, request);
        });
        this.saveRequestCoordinator.start();
    }

    entryKeyExtractor = entry => entry.data.id;

    render() {
        const {
            analysisFramework,
            leadId,
            entries,
            selectedEntryId,
        } = this.props;
        const {
            entryRests,
            entryDeleteRests,
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

        this.choices = this.props.entries.reduce(
            (acc, entry) => {
                const entryId = this.entryKeyExtractor(entry);
                const choice = calcEntryState({
                    entry,
                    rest: entryRests[entryId],
                    deleteRest: entryDeleteRests[entryId],
                });
                const isRemoveDisabled = (choice === ENTRY_STATUS.requesting);
                const isSaveDisabled = (choice !== ENTRY_STATUS.nonstale);
                const isWidgetDisabled = (choice === ENTRY_STATUS.requesting);
                acc[entryId] = {
                    choice,
                    isSaveDisabled,
                    isRemoveDisabled,
                    isWidgetDisabled,
                };
                return acc;
            },
            {},
        );

        const { isRemoveDisabled, isWidgetDisabled } = this.choices[selectedEntryId] || {};

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
                                leadId={leadId}
                                selectedEntryId={selectedEntryId}
                                entries={entries}
                                analysisFramework={analysisFramework}
                                onSaveAll={this.handleSaveAll}
                                onEntryAdd={this.handleAddEntry}
                                onEntryDelete={this.handleDeleteEntry}

                                removeDisabled={isRemoveDisabled}
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
                                leadId={leadId}
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
