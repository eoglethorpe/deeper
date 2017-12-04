import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    Pager,
    RawTable,
    FormattedDate,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    PrimaryButton,
    TransparentAccentButton,
    TransparentButton,
} from '../../../../public/components/Action';

import {
    reverseRoute,
    randomString,
} from '../../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadsOfProject,
} from '../../../../common/rest';
import {
    tokenSelector,

    activeProjectSelector,
    currentUserActiveProjectSelector,
    leadsForProjectSelector,
    totalLeadsCountForProjectSelector,

    setNavbarStateAction,

    setLeadsAction,

    leadPageFilterSelector,
    setLeadPageFilterAction,

    leadPageActiveSortSelector,
    setLeadPageActiveSortAction,

    leadPageActivePageSelector,
    setLeadPageActivePageAction,

    addAddLeadViewLeadsAction,
} from '../../../../common/redux';

import schema from '../../../../common/schema';

import {
    pathNames,
    pageTitles,
} from '../../../../common/constants/';

import FilterLeadsForm from './components/FilterLeadsForm';
import LeadColumnHeader from './components/LeadColumnHeader';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
    leads: PropTypes.array, // eslint-disable-line
    setLeads: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    totalLeadsCount: PropTypes.number,
    filters: PropTypes.object.isRequired, // eslint-disable-line
    setLeadPageFilter: PropTypes.func.isRequired,
    activeSort: PropTypes.string.isRequired, // eslint-disable-line
    setLeadPageActiveSort: PropTypes.func.isRequired,
    activePage: PropTypes.number.isRequired, // eslint-disable-line
    setLeadPageActivePage: PropTypes.func.isRequired,
    addLeads: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    currentUserActiveProject: currentUserActiveProjectSelector(state),
    leads: leadsForProjectSelector(state),
    totalLeadsCount: totalLeadsCountForProjectSelector(state),
    token: tokenSelector(state),

    activePage: leadPageActivePageSelector(state),
    activeSort: leadPageActiveSortSelector(state),
    filters: leadPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),

    addLeads: leads => dispatch(addAddLeadViewLeadsAction(leads)),
});

const MAX_LEADS_PER_REQUEST = 16;

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
            },
            {
                key: 'created_by',
                label: 'Created by',
                order: 2,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'created_at',
                label: 'Created at',
                order: 3,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'published_on',
                label: 'Published on',
                order: 4,
                modifier: row => (
                    <FormattedDate
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'confidentiality',
                label: 'Confidentiality',
                order: 5,
            },
            {
                key: 'source',
                label: 'Source',
                order: 6,
            },
            {
                key: 'no_of_entries',
                label: 'No. of entries',
                order: 7,
            },
            {
                key: 'status',
                label: 'Status',
                order: 8,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 9,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            title="Search similar lead"
                            onClick={() => this.handleSearchSimilarLead(row)}
                        >
                            <i className="ion-search" />
                        </TransparentButton>
                        <TransparentButton
                            title="Edit lead"
                            onClick={() => this.handleEditLeadClick(row)}
                        >
                            <i className="ion-edit" />
                        </TransparentButton>
                        <TransparentAccentButton
                            title="Add entry from this lead"
                            onClick={() => this.handleAddEntryClick(row)}
                        >
                            <i className="ion-forward" />
                        </TransparentAccentButton>
                    </div>
                ),
            },
        ];

        this.state = {
            loadingLeads: false,
            redirectTo: undefined,
        };
    }

    componentWillMount() {
        console.log('Mounting Leads');

        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.leads,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.categoryEditor,
                pageTitles.projectPanel,
            ],
        });

        const {
            activeProject,
            activeSort,
            filters,
            activePage,
        } = this.props;

        this.leadRequest = this.createRequestForProjectLeads({
            activeProject,
            activePage,
            activeSort,
            filters,
        });
        this.leadRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage
        ) {
            this.leadRequest.stop();
            this.leadRequest = this.createRequestForProjectLeads({
                activeProject,
                activePage,
                activeSort,
                filters,
            });
            this.leadRequest.start();
        }
    }

    componentWillUnmount() {
        this.leadRequest.stop();
    }

    // REST UTILS

    getFiltersForRequest = (filters) => {
        const requestFilters = {};
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
            switch (key) {
                case 'created_at':
                    if (filter) {
                        requestFilters.created_at__gte = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.created_at__lte = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                case 'published_on':
                    if (filter) {
                        requestFilters.published_on__gte = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.published_on__lte = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                default:
                    requestFilters[key] = filter;
                    break;
            }
        });
        return requestFilters;
    }

    // REST

    createRequestForProjectLeads = ({ activeProject, activePage, activeSort, filters }) => {
        const sanitizedFilters = this.getFiltersForRequest(filters);
        const leadRequestOffset = (activePage - 1) * MAX_LEADS_PER_REQUEST;
        const leadRequestLimit = MAX_LEADS_PER_REQUEST;

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            ordering: activeSort,
            ...sanitizedFilters,
            offset: leadRequestOffset,
            limit: leadRequestLimit,
        });

        const leadRequest = new RestBuilder()
            .url(urlForProjectLeads)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .retryTime(1000)
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .postLoad(() => {
                this.setState({ loadingLeads: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadsGetResponse');
                    this.props.setLeads({
                        projectId: activeProject,
                        leads: response.results,
                        totalLeadsCount: response.count,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return leadRequest;
    }

    // UI

    handleAddLeadClick = () => {
        const params = {
            projectId: this.props.activeProject,
        };

        this.setState({ redirectTo: reverseRoute(pathNames.addLeads, params) });
    }

    handleAddEntryClick = (row) => {
        const params = {
            projectId: this.props.activeProject,
            leadId: row.id,
        };

        this.setState({ redirectTo: reverseRoute(pathNames.addLeads, params) });
    }

    handleEditLeadClick = (row) => {
        // TODO: while editing, set leads such that serverId is never repeated
        const newLeads = [];

        const type = row.type || 'text';
        const values = {
            title: row.title,
            project: row.project,
            source: row.source,
            confidentiality: row.confidentiality,
            assignee: row.assignee,
            publishedOn: row.publishedOn,
            attachment: row.attachment,
            website: row.website,
            url: row.url,
            text: row.text,
        };
        const serverId = row.id;

        const uid = randomString();
        const newLeadId = `lead-${uid}`;
        newLeads.push({
            id: newLeadId,

            type,
            serverId,
            values,

            stale: true,
        });
        this.props.addLeads(newLeads);

        this.handleAddLeadClick();
    }

    handleSearchSimilarLead = (row) => {
        this.props.setLeadPageFilter({
            filters: { similar: row.id },
        });
    };

    handlePageClick = (page) => {
        this.props.setLeadPageActivePage({ activePage: page });
    }

    // TABLE

    leadKeyExtractor = lead => (lead.id.toString())

    leadModifier = (lead, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(lead);
        }
        return lead[columnKey];
    }

    isColumnClickable = key => (
        ['actions'].indexOf(key) === -1
    )

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder;
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <LeadColumnHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={this.isColumnClickable(headerData.key)}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        // prevent click on 'actions' column
        if (!this.isColumnClickable(key)) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setLeadPageActiveSort({ activeSort });
    }

    render() {
        console.log('Rendering Leads');

        const {
            currentUserActiveProject,
            totalLeadsCount,
            activePage,
        } = this.props;

        const {
            loadingLeads,
        } = this.state;

        const projectName = currentUserActiveProject.title;

        if (this.state.redirectTo) {
            return (
                <Redirect
                    to={this.state.redirectTo}
                    push
                />
            );
        }

        return (
            <div styleName="leads">
                <Helmet>
                    <title>
                        { pageTitles.leads } | { projectName}
                    </title>
                </Helmet>

                <header styleName="header">
                    <FilterLeadsForm
                        styleName="filters"
                        value={this.props.filters}
                    />
                    <PrimaryButton
                        styleName="add-lead-button"
                        onClick={this.handleAddLeadClick}
                        iconName="ion-android-add"
                    >
                        Add leads
                    </PrimaryButton>
                </header>

                <div styleName="table-container">
                    <RawTable
                        data={this.props.leads}
                        dataModifier={this.leadModifier}
                        headerModifier={this.headerModifier}
                        headers={this.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keyExtractor={this.leadKeyExtractor}
                        styleName="leads-table"
                    />
                    { loadingLeads && <LoadingAnimation /> }
                </div>

                <footer styleName="footer">
                    <Pager
                        activePage={activePage}
                        styleName="pager"
                        itemsCount={totalLeadsCount}
                        maxItemsPerPage={MAX_LEADS_PER_REQUEST}
                        onPageClick={this.handlePageClick}
                    />
                </footer>
            </div>
        );
    }
}
