import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import { randomString } from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';
import { CoordinatorBuilder } from '../../../../public/utils/coordinate';
import update from '../../../../public/utils/immutable-update';
import { LoadingAnimation } from '../../../../public/components/View';

import {
    leadIdFromRoute,
    /*
    editEntryViewCurrentLeadSelector,
    editEntryViewCurrentProjectSelector,
    */
    editEntryViewCurrentAnalysisFrameworkSelector,
    editEntryViewEntriesSelector,
    editEntryViewSelectedEntryIdSelector,

    setAnalysisFrameworkAction,
    setEditEntryViewLeadAction,
    setProjectAction,

    saveEntryAction,
    changeEntryAction,
    diffEntriesAction,
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
} from '../../../../common/rest';
import schema from '../../../../common/schema';

import { ENTRY_STATUS, DIFF_ACTION } from './utils/constants';
import { calcEntryState } from './utils/entryState';

import styles from './styles.scss';
import Overview from './Overview';
import List from './List';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.string.isRequired,
    /*
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    */
    setAnalysisFramework: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,

    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    selectedEntryId: PropTypes.string,

    saveEntry: PropTypes.func.isRequired,
    changeEntry: PropTypes.func.isRequired,
    diffEntries: PropTypes.func.isRequired,
};

const defaultProps = {
    /*
    lead: undefined,
    project: undefined,
    */
    analysisFramework: undefined,
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),

    /*
    lead: editEntryViewCurrentLeadSelector(state, props),
    project: editEntryViewCurrentProjectSelector(state, props),
    */

    entries: editEntryViewEntriesSelector(state, props),
    selectedEntryId: editEntryViewSelectedEntryIdSelector(state, props),
    analysisFramework: editEntryViewCurrentAnalysisFrameworkSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    saveEntry: params => dispatch(saveEntryAction(params)),
    changeEntry: params => dispatch(changeEntryAction(params)),

    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryViewLeadAction(params)),
    setProject: params => dispatch(setProjectAction(params)),

    diffEntries: params => dispatch(diffEntriesAction(params)),
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
            pendingSubmitAll: false,
            pendingLeadAndEntries: false,
            pendingProjectAndAf: true,
        };

        this.saveCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .preSession(() => {
                this.setState({ pendingSubmitAll: true });
            })
            .postSession(() => {
                this.setState({ pendingSubmitAll: false });
            })
            .build();
    }

    componentWillMount() {
        this.leadRequest = this.createRequestForLead(this.props.leadId);
        this.leadRequest.start();
    }

    componentWillUnmount() {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }

        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }

        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }

        this.saveCoordinator.close();
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

    calcEntriesDiff = (locals, remotes) => {
        const remoteEntriesMap = remotes.reduce(
            (acc, entry) => {
                acc[entry.id] = entry;
                return acc;
            },
            {},
        );
        const actions = locals.reduce(
            (arr, localEntry) => {
                const serverId = localEntry.data.serverId;
                const id = localEntry.data.id;
                const remoteEntry = remoteEntriesMap[serverId];
                if (!serverId) {
                    // this localEntry hasn't been saved
                    arr.push({ id, action: DIFF_ACTION.noop });
                } else if (!remoteEntry) {
                    // this entry is removed from server
                    arr.push({ id, serverId, action: DIFF_ACTION.remove });
                    // OK: remove
                    // SKIP: nothing
                } else if (localEntry.data.versionId < remoteEntry.versionId) {
                    // this entry is updated on server
                    const entry = remoteEntry;
                    const newEntry = {
                        id: localEntry.data.id,
                        serverId: entry.id, // here
                        versionId: entry.versionId,
                        values: {
                            exceprt: entry.excerpt,
                            image: entry.image,
                            lead: entry.lead,
                            analysisFramework: entry.analysisFramework,
                            attribues: entry.attribues,
                            exportData: entry.exportData,
                            filterData: entry.filterData,
                        },
                    };
                    arr.push({ id, serverId, action: DIFF_ACTION.replace, entry: newEntry });
                    // OK: set versionId, generate id, clear uiState
                    // SKIP: set versionId
                } else {
                    arr.push({ id, serverId, action: DIFF_ACTION.noop });
                }
                return arr;
            },
            [],
        );

        const localEntriesMap = locals.reduce(
            (acc, entry) => {
                if (entry.data.serverId) {
                    acc[entry.data.serverId] = true;
                }
                return acc;
            },
            {},
        );
        const actions2 = remotes.reduce(
            (acc, entry) => {
                const serverId = entry.id;
                const localEntry = localEntriesMap[serverId];
                if (!localEntry) {
                    const newEntry = {
                        id: randomString(),
                        serverId: entry.id, // here
                        values: {
                            excerpt: entry.excerpt,
                            image: entry.image,
                            lead: entry.lead,
                            analysisFramework: entry.analysisFramework,
                            attribues: entry.attribues,
                            exportData: entry.exportData,
                            filterData: entry.filterData,
                        },
                        stale: true,
                    };
                    acc.push({ serverId, action: DIFF_ACTION.add, entry: newEntry });
                }
                return acc;
            },
            [],
        );

        return [...actions2, ...actions];
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
                    const diffs = this.calcEntriesDiff(this.props.entries, entries);
                    this.props.diffEntries({ leadId, diffs });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return entriesRequest;
    };

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
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
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

                this.saveCoordinator.notifyComplete(entryId);
            })
            .failure((response) => {
                console.warn('FAILURE:', response);
                const uiState = { error: true };
                this.props.changeEntry({ leadId, entryId, uiState });
                this.saveCoordinator.notifyComplete(entryId);
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                const uiState = { error: true };
                this.props.changeEntry({ leadId, entryId, uiState });
                this.saveCoordinator.notifyComplete(entryId);
            })
            .build();

        const interceptor = {
            start: () => {
                if (this.choices[entryId].isSaveDisabled) {
                    this.saveCoordinator.notifyComplete(entryId);
                } else {
                    entrySaveRequest.start();
                }
            },
            stop: entrySaveRequest.stop,
        };

        return interceptor;
    };

    handleSaveAll = () => {
        const entryKeys = this.props.entries
            .map(this.entryKeyExtractor);
        entryKeys.forEach((id) => {
            const request = this.createRequestForEntrySave(id);
            this.saveCoordinator.add(id, request);
        });
        this.saveCoordinator.start();
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
            pendingSubmitAll,
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
                });
                const isRemoveDisabled = (choice === ENTRY_STATUS.requesting);
                const isSaveDisabled = (choice !== ENTRY_STATUS.nonstale);
                acc[entryId] = { choice, isSaveDisabled, isRemoveDisabled };
                return acc;
            },
            {},
        );

        const someSaveEnabled = Object.keys(this.choices).some(
            key => !(this.choices[key].isSaveDisabled),
        );

        return (
            <HashRouter>
                <div styleName="edit-entry">
                    <Route
                        exact
                        path="/"
                        component={
                            () => (
                                <Redirect to="/overview" />
                            )
                        }
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
                                saveAllDisabled={pendingSubmitAll || !someSaveEnabled}
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
