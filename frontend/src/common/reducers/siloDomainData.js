import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,

    SET_ADD_LEAD_VIEW_FILTERS,
    SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID,
    ADD_ADD_LEAD_VIEW_LEADS,
    ADD_LEAD_VIEW_LEAD_CHANGE,
    ADD_LEAD_VIEW_LEAD_SET_PENDING,
    ADD_LEAD_VIEW_LEAD_SAVE,
    SET_LEAD_PAGE_FILTER,
    SET_LEAD_PAGE_ACTIVE_PAGE,
    SET_LEAD_PAGE_ACTIVE_SORT,
} from '../action-types/siloDomainData';

import {
    SET_USER_PROJECTS,
} from '../action-types/domainData';

import {
    activeProjectSelector,
} from '../selectors/siloDomainData';

import initialSiloDomainData from '../initial-state/siloDomainData';
import update from '../../public/utils/immutable-update';

const strMatchesSub = (str, sub) => (str.toLowerCase().includes(sub.toLowerCase()));

const siloDomainDataReducer = (state = initialSiloDomainData, action) => {
    switch (action.type) {
        case SET_ACTIVE_PROJECT: {
            const settings = {
                activeProject: {
                    $set: action.activeProject,
                },
            };
            return update(state, settings);
        }
        case SET_USER_PROJECTS: {
            let activeProject = activeProjectSelector({ siloDomainData: state });
            if (action.projects && action.projects.length > 0) {
                const key = action.projects.findIndex(project => project.id === activeProject);
                if (key < 0) {
                    activeProject = action.projects[0].id;
                }
            }

            const settings = {
                activeProject: {
                    $set: activeProject,
                },
            };
            return update(state, settings);
        }
        case SET_ACTIVE_COUNTRY: {
            const settings = {
                activeCountry: {
                    $set: action.activeCountry,
                },
            };
            return update(state, settings);
        }
        case ADD_ADD_LEAD_VIEW_LEADS: {
            // TODO: set latest lead as active
            const { leads } = action;
            const settings = {
                addLeadView: {
                    leads: {
                        $unshift: leads,
                    },
                    filters: {
                        $set: {
                            search: '',
                            type: [],
                            source: '',
                            status: '',
                        },
                    },
                },
            };
            const newState = update(state, settings);

            const leadsSettings = {
                addLeadView: {
                    leads: {},
                },
            };
            newState.addLeadView.leads.forEach((lead, i) => {
                leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: true } };
            });
            return update(newState, leadsSettings);
        }
        case SET_ADD_LEAD_VIEW_FILTERS: {
            const settings = {
                addLeadView: {
                    filters: {
                        $merge: action.filters,
                    },
                },
            };
            const newState = update(state, settings);

            // Filtering logic
            const {
                search,
                type,
                source,
                // status,
            } = newState.addLeadView.filters;

            const leadsSettings = {
                addLeadView: {
                    leads: {},
                },
            };
            newState.addLeadView.leads.forEach((lead, i) => {
                const {
                    title: leadTitle = '',
                    source: leadSource = '',
                } = lead.form.values;
                const {
                    type: leadType,
                } = lead.data;
                if (search.length !== 0 && !strMatchesSub(leadTitle, search)) {
                    leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: false } };
                } else if (type.length !== 0 && type.indexOf(leadType) === -1) {
                    leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: false } };
                } else if (source.length !== 0 && !strMatchesSub(leadSource, source)) {
                    leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: false } };
                } else {
                    leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: true } };
                }
            });
            return update(newState, leadsSettings);
        }
        case ADD_LEAD_VIEW_LEAD_CHANGE: {
            const {
                leadId,
                values,
                formErrors,
                formFieldErrors,
            } = action;

            const index = state.addLeadView.leads.findIndex(
                lead => lead.data.id === leadId,
            );

            // NOTE: if values is defined, it is onChange else onFailure action
            // stale must be true if onChange
            const settings = {
                addLeadView: {
                    leads: {
                        [index]: {
                            uiState: {
                                $merge: {
                                    stale: !!values,
                                    error: false,
                                },
                            },
                            form: {
                                values: { $merge: values || {} },
                                errors: { $merge: formErrors },
                                fieldErrors: { $merge: formFieldErrors },
                            },
                        },
                    },
                },
            };
            return update(state, settings);
        }
        case ADD_LEAD_VIEW_LEAD_SET_PENDING: {
            const {
                leadId,
                pending,
            } = action;

            const index = state.addLeadView.leads.findIndex(
                lead => lead.data.id === leadId,
            );

            const settings = {
                addLeadView: {
                    leads: {
                        [index]: {
                            uiState: {
                                pending: {
                                    $set: pending,
                                },
                            },
                        },
                    },
                },
            };
            return update(state, settings);
        }
        case SET_LEAD_PAGE_FILTER: {
            const { filters } = action;
            const { activeProject } = state;
            const settings = {
                leadPage: {
                    [activeProject]: { $auto: {
                        filter: { $set: filters },
                        activePage: { $set: 1 },
                    } },
                },
            };
            return update(state, settings);
        }
        case ADD_LEAD_VIEW_LEAD_SAVE: {
            const {
                leadId,
                serverId,
            } = action;

            const index = state.addLeadView.leads.findIndex(
                lead => lead.data.id === leadId,
            );

            const settings = {
                addLeadView: {
                    leads: {
                        [index]: {
                            uiState: {
                                $merge: {
                                    pending: false,
                                    stale: false,
                                },
                            },
                            serverId: { $set: serverId },
                        },
                    },
                },
            };
            return update(state, settings);
        }
        case SET_LEAD_PAGE_ACTIVE_PAGE: {
            const { activePage } = action;
            const { activeProject } = state;
            const settings = {
                leadPage: {
                    [activeProject]: { $auto: {
                        activePage: { $set: activePage },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID: {
            const settings = {
                addLeadView: {
                    activeLeadId: {
                        $set: action.leadId,
                    },
                },
            };
            return update(state, settings);
        }
        case SET_LEAD_PAGE_ACTIVE_SORT: {
            const { activeSort } = action;
            const { activeProject } = state;
            const settings = {
                leadPage: {
                    [activeProject]: { $auto: {
                        activeSort: { $set: activeSort },
                        activePage: { $set: 1 },
                    } },
                },
            };
            return update(state, settings);
        }
        default:
            return state;
    }
};

export default siloDomainDataReducer;
