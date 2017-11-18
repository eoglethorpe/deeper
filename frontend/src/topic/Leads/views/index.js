import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../public/utils/rest';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Pager,
    RawTable,
    FormattedDate,
} from '../../../public/components/View';
import {
    PrimaryButton,
    TransparentAccentButton,
    TransparentButton,
} from '../../../public/components/Action';

import {
    createParamsForUser,
    createUrlForLeadsOfProject,
} from '../../../common/rest';
import {
    tokenSelector,

    activeProjectSelector,
    currentUserActiveProjectSelector,
    leadsForProjectSelector,
    totalLeadsCountForProjectSelector,

    setNavbarStateAction,

    setLeadsAction,
} from '../../../common/redux';

import browserHistory from '../../../common/browserHistory';
import schema from '../../../common/schema';
import { pageTitles } from '../../../common/utils/labels';

import EditLeadForm from '../components/EditLeadForm';
import FilterLeadsForm from '../components/FilterLeadsForm';
import LeadColumnHeader from '../components/LeadColumnHeader';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
    leads: PropTypes.array, // eslint-disable-line
    setLeads: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    totalLeadsCount: PropTypes.number,
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
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

const MAX_LEADS_PER_REQUEST = 18;

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.filters = [];

        this.state = {
            editRow: {},
            showEditLeadModal: false,
            activeSort: '-created_at',
            activePage: 1,
            loadingLeads: false,
            headers: [
                {
                    key: 'created_at',
                    label: 'Created at',
                    order: 1,
                    modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
                },
                {
                    key: 'created_by',
                    label: 'Created by',
                    order: 2,
                    modifier: row => (
                        <Link
                            key={row.createdBy}
                            to={`/users/${row.createdBy}/`}
                        >
                            {row.createdByName}
                        </Link>
                    ),
                },
                {
                    key: 'title',
                    label: 'Title',
                    order: 3,
                },
                {
                    key: 'published_on',
                    label: 'Published',
                    order: 4,
                    modifier: row => <FormattedDate date={row.publishedOn} mode="dd-MM-yyyy" />,
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
                                tooltip="Edit lead"
                                onClick={() => this.handleEditLeadClick(row)}
                            >
                                <i className="ion-edit" />
                            </TransparentButton>
                            <TransparentAccentButton >
                                <i className="ion-forward" />
                            </TransparentAccentButton>
                        </div>
                    ),
                },
            ],
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
                pageTitles.projectPanel,
            ],
        });

        const { activeProject } = this.props;
        this.requestProjectLeads(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject } = nextProps;

        if (this.props.activeProject !== activeProject) {
            this.requestProjectLeads(activeProject);
        }
    }

    componentWillUnmount() {
        this.leadRequest.stop();
    }

    getFiltersForRequest = () => {
        const { filters } = this;
        const requestFilters = {};

        const filterKeys = Object.keys(filters);

        filterKeys.forEach((key) => {
            const filter = filters[key];

            switch (key) {
                case 'created_at':
                    requestFilters.created_at__gte = '2010-10-12';
                    requestFilters.created_at__lte = '2019-12-01';
                    break;
                case 'published_on':
                    requestFilters.published_on__gte = '2010-09-01';
                    requestFilters.published_on__lte = '2019-12-01';
                    break;
                default:
                    requestFilters[key] = filter;
                    break;
            }
        });

        return requestFilters;
    }

    requestProjectLeads = (activeProject) => {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }

        this.leadRequest = this.createRequestForProjectLeads(activeProject);
        this.leadRequest.start();
    }

    createRequestForProjectLeads = (activeProject) => {
        const {
            activePage,
        } = this.state;
        const filters = this.getFiltersForRequest();

        const leadRequestOffset = (activePage - 1) * MAX_LEADS_PER_REQUEST;
        const leadRequestLimit = MAX_LEADS_PER_REQUEST;

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            ordering: this.state.activeSort,
            ...filters,
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

    handleEditLeadClick = (row) => {
        this.setState({
            editRow: row,
            showEditLeadModal: true,
        });
    }

    handleEditLeadModalClose = () => {
        this.setState({
            // editRow: {},
            showEditLeadModal: false,
        });
    }

    leadKeyExtractor = lead => (lead.id.toString())

    leadModifier = (lead, columnKey) => {
        const header = this.state.headers.find(d => d.key === columnKey);

        if (header.modifier) {
            return header.modifier(lead);
        }

        return lead[columnKey];
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.state;
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

    handleAddLeadClick = () => {
        browserHistory.push(`/${this.props.activeProject}/leads/new/`);
    }

    handleApplyFilters = (filters) => {
        const { activeProject } = this.props;

        this.filters = filters;
        this.setState({
            activePage: 1,
        }, () => {
            this.requestProjectLeads(activeProject);
        });
    }

    handleTableHeaderClick = (key) => {
        // prevent click on 'actions' column
        if (!this.isColumnClickable(key)) {
            return;
        }

        const { activeProject } = this.props;
        let { activeSort } = this.state;

        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }

        // force redraw of headers (so that header modifiers are called)
        const headers = [...this.state.headers];
        this.setState({
            headers,
            activeSort,
            activePage: 1,
        }, () => {
            this.requestProjectLeads(activeProject);
        });
    }

    handlePageClick = (page) => {
        const { activeProject } = this.props;
        this.setState({
            activePage: page,
        }, () => {
            this.requestProjectLeads(activeProject);
        });
    }

    isColumnClickable = key => (
        ['actions'].indexOf(key) === -1
    )

    render() {
        console.log('Rendering Leads');

        const {
            currentUserActiveProject,
            totalLeadsCount,
        } = this.props;

        const {
            activePage,
            loadingLeads,
        } = this.state;

        const projectName = currentUserActiveProject.title;

        return (
            <div styleName="leads">
                <Helmet>
                    <title>
                        { pageTitles.leads } | { projectName}
                    </title>
                </Helmet>

                <header styleName="header">
                    <h1>
                        { pageTitles.leads }
                    </h1>
                    <PrimaryButton
                        styleName="add-lead-button"
                        onClick={() => this.handleAddLeadClick()}
                    >
                        Add lead
                    </PrimaryButton>
                </header>

                <FilterLeadsForm
                    styleName="filters"
                    onSubmit={this.handleApplyFilters}
                />

                <div styleName="table-container">
                    <RawTable
                        data={this.props.leads}
                        dataModifier={this.leadModifier}
                        headerModifier={this.headerModifier}
                        headers={this.state.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keyExtractor={this.leadKeyExtractor}
                        styleName="leads-table"
                    />
                    {
                        loadingLeads && (
                            <div styleName="loading-animation">
                                <span className="ion-load-c" styleName="icon" />
                            </div>
                        )
                    }
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

                <Modal
                    closeOnEscape
                    onClose={this.handleEditLeadModalClose}
                    show={this.state.showEditLeadModal}
                >
                    <ModalHeader
                        title="Edit lead"
                    />
                    <ModalBody>
                        <EditLeadForm
                            onSubmit={() => {}}
                            onCancel={this.handleEditLeadModalClose}
                            pending={false}
                            values={this.state.editRow}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
