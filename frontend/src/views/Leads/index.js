import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import {
    reverseRoute,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Pager from '../../vendor/react-store/components/View/Pager';
import RawTable from '../../vendor/react-store/components/View/RawTable';
import TableHeader from '../../vendor/react-store/components/View/TableHeader';
import BoundError from '../../components/BoundError';
import ActionButtons from './ActionButtons';

import {
    createParamsForUser,
    createUrlForLeadsOfProject,
    createUrlForLeadDelete,
    createParamsForLeadDelete,
    transformResponseErrorToFormError,
} from '../../rest';
import {
    activeProjectSelector,
    leadsForProjectSelector,
    totalLeadsCountForProjectSelector,

    setLeadsAction,

    leadPageFilterSelector,
    setLeadPageFilterAction,

    leadPageActiveSortSelector,
    setLeadPageActiveSortAction,

    leadPageActivePageSelector,
    setLeadPageActivePageAction,

    leadsStringsSelector,
} from '../../redux';
import {
    iconNames,
    pathNames,
} from '../../constants/';
import { leadTypeIconMap } from '../../entities/lead';
import schema from '../../schema';
import notify from '../../notify';

import FilterLeadsForm from './FilterLeadsForm';
import styles from './styles.scss';

const propTypes = {
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setLeads: PropTypes.func.isRequired,
    totalLeadsCount: PropTypes.number,
    setLeadPageFilter: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    setLeadPageActivePage: PropTypes.func.isRequired,

    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
    totalLeadsCount: 0,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),

    leads: leadsForProjectSelector(state, props),
    totalLeadsCount: totalLeadsCountForProjectSelector(state, props),
    activePage: leadPageActivePageSelector(state, props),
    activeSort: leadPageActiveSortSelector(state, props),
    filters: leadPageFilterSelector(state, props),
    leadsStrings: leadsStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
});

const MAX_LEADS_PER_REQUEST = 24;

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // TODO: IMP move this somewhere
    static getFiltersForRequest = (filters) => {
        const requestFilters = {};
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
            switch (key) {
                case 'created_at':
                    if (filter) {
                        requestFilters.created_at__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.created_at__lt = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                case 'published_on':
                    if (filter) {
                        requestFilters.published_on__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.published_on__lt = FormattedDate.format(
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

    constructor(props) {
        super(props);

        const MimeType = this.renderMimeType;

        this.headers = [
            {
                key: 'attachmentMimeType',
                label: this.props.leadsStrings('filterSourceType'),
                order: 1,
                sortable: false,
                modifier: row => <MimeType row={row} />,
            },
            {
                key: 'title',
                label: this.props.leadsStrings('titleLabel'),
                order: 2,
                sortable: true,
            },
            {
                key: 'source',
                label: this.props.leadsStrings('tableHeaderPublisher'),
                order: 3,
                sortable: true,
            },
            {
                key: 'published_on',
                label: this.props.leadsStrings('tableHeaderDatePublished'),
                order: 4,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                label: this.props.leadsStrings('tableHeaderOwner'),
                order: 5,
                sortable: true,
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
                label: this.props.leadsStrings('tableHeaderDateCreated'),
                order: 6,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'confidentiality',
                label: this.props.leadsStrings('tableHeaderConfidentiality'),
                sortable: true,
                order: 7,
                modifier: row => (
                    <div className="capitalize">
                        {row.confidentiality}
                    </div>
                ),
            },
            {
                key: 'status',
                label: this.props.leadsStrings('tableHeaderStatus'),
                sortable: true,
                order: 8,
                modifier: row => (
                    <div className="capitalize">
                        {row.status}
                    </div>
                ),
            },
            {
                key: 'no_of_entries',
                label: this.props.leadsStrings('tableHeaderNoOfEntries'),
                order: 9,
                sortable: true,
                modifier: row => row.noOfEntries,
            },
            {
                key: 'actions',
                label: this.props.leadsStrings('tableHeaderActions'),
                order: 10,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        leadsStrings={this.props.leadsStrings}
                        onSearchSimilarLead={this.handleSearchSimilarLead}
                        onRemoveLead={this.handleRemoveLead}
                        activeProject={this.props.activeProject}
                    />
                ),
            },
        ];

        this.state = {
            loadingLeads: false,
            redirectTo: undefined,

            showDeleteModal: false,
            leadToDelete: undefined,
        };
    }

    componentWillMount() {
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

        if (this.leadDeleteRequest) {
            this.leadDeleteRequest.stop();
        }
    }

    // REST

    createRequestForProjectLeads = ({ activeProject, activePage, activeSort, filters }) => {
        const sanitizedFilters = Leads.getFiltersForRequest(filters);
        const leadRequestOffset = (activePage - 1) * MAX_LEADS_PER_REQUEST;
        const leadRequestLimit = MAX_LEADS_PER_REQUEST;

        // TODO: VAGUE add required fields only
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            ordering: activeSort,
            ...sanitizedFilters,
            offset: leadRequestOffset,
            limit: leadRequestLimit,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
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
            .failure((response) => {
                const { formErrors: { errors = [] } } =
                    transformResponseErrorToFormError(response.errors);
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: errors.join(''),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
    }

    createRequestForLeadDelete = (lead) => {
        const { id } = lead;
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLeadDelete(id))
            .params(() => createParamsForLeadDelete())
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .success(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.SUCCESS,
                    message: this.props.leadsStrings('leadDeleteSuccess'),
                    duration: notify.duration.MEDIUM,
                });

                if (this.leadRequest) {
                    this.leadRequest.stop();
                }
                const { activeProject, activePage, activeSort, filters } = this.props;
                this.leadRequest = this.createRequestForProjectLeads({
                    activeProject,
                    activePage,
                    activeSort,
                    filters,
                });
                this.leadRequest.start();
            })
            .failure((response) => {
                const { formErrors: { errors = [] } } =
                    transformResponseErrorToFormError(response.errors);
                notify.send({
                    title: this.props.leadsStrings('leadDelete'),
                    type: notify.type.ERROR,
                    message: errors.join(''),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.leadsStrings('leadDelete'),
                    type: notify.type.ERROR,
                    message: this.props.leadsStrings('leadDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
    }

    // UI

    handleSearchSimilarLead = (row) => {
        this.props.setLeadPageFilter({
            filters: { similar: row.id },
        });
    };

    handleRemoveLead = (row) => {
        this.setState({
            showDeleteModal: true,
            leadToDelete: row,
        });
    };

    handleDeleteModalClose = (confirm) => {
        if (confirm) {
            const { leadToDelete } = this.state;
            if (this.leadDeleteRequest) {
                this.leadDeleteRequest.stop();
            }
            this.leadDeleteRequest = this.createRequestForLeadDelete(leadToDelete);
            this.leadDeleteRequest.start();
        }

        this.setState({
            showDeleteModal: false,
            leadToDelete: undefined,
        });
    }

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

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
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

    renderMimeType = ({ row }) => {
        let icon = iconNames.documentText;
        let url;
        if (row.attachment) {
            icon = leadTypeIconMap[row.attachment.mimeType];
            url = row.attachment.file;
        } else if (row.url) {
            icon = iconNames.globe;
            url = row.url;
        }
        if (!url) {
            return (
                <div className="icon-wrapper">
                    <i className={icon} />
                </div>
            );
        }
        return (
            <div className="icon-wrapper">
                <a href={url} target="_blank">
                    <i className={icon} />
                </a>
            </div>
        );
    }

    renderHeader = () => {
        const addLeadLink = reverseRoute(
            pathNames.addLeads,
            { projectId: this.props.activeProject },
        );

        return (
            <header className={styles.header}>
                <FilterLeadsForm className={styles.filters} />
                <Link
                    to={addLeadLink}
                    className={styles.addLeadLink}
                >
                    {/* add icon aswell */}
                    {this.props.leadsStrings('addSourcesButtonLabel')}
                </Link>
            </header>
        );
    }
    renderFooter = () => {
        const {
            activeProject,
            totalLeadsCount,
            activePage,
        } = this.props;

        const showVisualizationLink = reverseRoute(
            pathNames.leadsViz,
            { projectId: activeProject },
        );

        // FIXME: use strings
        return (
            <footer className={styles.footer}>
                <div className={styles.linkContainer}>
                    <Link
                        className={styles.link}
                        to={showVisualizationLink}
                        replace
                    >
                        Show Visualization
                    </Link>
                </div>
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={totalLeadsCount}
                    maxItemsPerPage={MAX_LEADS_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    render() {
        const {
            loadingLeads,
            showDeleteModal,
            redirectTo,
        } = this.state;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        return (
            <div className={styles.leads}>
                <Header />
                <div className={styles.tableContainer}>
                    <RawTable
                        data={this.props.leads}
                        dataModifier={this.leadModifier}
                        headerModifier={this.headerModifier}
                        headers={this.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keyExtractor={this.leadKeyExtractor}
                        className={styles.leadsTable}
                    />
                    { loadingLeads && <LoadingAnimation /> }
                </div>
                <Footer />
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.handleDeleteModalClose}
                >
                    <p>
                        {this.props.leadsStrings('leadDeleteConfirmText')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
