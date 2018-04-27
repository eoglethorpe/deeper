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
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import Pager from '../../vendor/react-store/components/View/Pager';
import RawTable from '../../vendor/react-store/components/View/RawTable';
import TableHeader from '../../vendor/react-store/components/View/TableHeader';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import ActionButtons from './ActionButtons';

import {
    activeProjectIdFromStateSelector,
    leadsForProjectSelector,
    totalLeadsCountForProjectSelector,

    setLeadsAction,

    leadPageFilterSelector,
    setLeadPageFilterAction,

    leadPageActiveSortSelector,
    setLeadPageActiveSortAction,

    leadPageActivePageSelector,
    setLeadPageActivePageAction,

    leadPageLeadsPerPageSelector,
    setLeadPageLeadsPerPageAction,

    leadsStringsSelector,

    removeLeadAction,
    patchLeadAction,
} from '../../redux';
import {
    iconNames,
    pathNames,
} from '../../constants/';
import { leadTypeIconMap } from '../../entities/lead';

import LeadsRequest from './requests/LeadsRequest';
import PatchLeadRequest from './requests/PatchLeadRequest';
import DeleteLeadRequest from './requests/DeleteLeadRequest';
import FilterLeadsForm from './FilterLeadsForm';
import styles from './styles.scss';

const propTypes = {
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    leadsPerPage: PropTypes.number.isRequired,
    setLeads: PropTypes.func.isRequired,
    removeLead: PropTypes.func.isRequired,
    patchLead: PropTypes.func.isRequired,

    totalLeadsCount: PropTypes.number,
    setLeadPageFilter: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    setLeadPageActivePage: PropTypes.func.isRequired,
    setLeadsPerPage: PropTypes.func.isRequired,

    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
    totalLeadsCount: 0,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),

    leads: leadsForProjectSelector(state, props),
    totalLeadsCount: totalLeadsCountForProjectSelector(state, props),
    activePage: leadPageActivePageSelector(state, props),
    activeSort: leadPageActiveSortSelector(state, props),
    leadsPerPage: leadPageLeadsPerPageSelector(state, props),
    filters: leadPageFilterSelector(state, props),
    leadsStrings: leadsStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    removeLead: params => dispatch(removeLeadAction(params)),
    patchLead: params => dispatch(patchLeadAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    setLeadsPerPage: params => dispatch(setLeadPageLeadsPerPageAction(params)),
});

const ACTION = {
    delete: 'delete',
    markAsPending: 'markAsPending',
    markAsProcessed: 'markAsProcessed',
};

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadsPerPageOptions = [
        { label: '25', key: 25 },
        { label: '50', key: 50 },
        { label: '75', key: 75 },
        { label: '100', key: 100 },
    ];

    static leadKeyExtractor = lead => String(lead.id)

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'attachmentMimeType',
                label: this.props.leadsStrings('filterSourceType'),
                order: 1,
                sortable: false,
                modifier: (row) => {
                    const MimeType = this.renderMimeType;
                    return (
                        <MimeType row={row} />
                    );
                },
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
                key: 'assignee',
                label: 'Assignee', // FIXME: use strings
                order: 6,
                sortable: false,
                modifier: row => (
                    (row.assigneeDetails || []).map(person => (
                        <Link
                            key={person.id}
                            className={styles.assigneeLink}
                            to={reverseRoute(pathNames.userProfile, { userId: person.id })}
                        >
                            {person.displayName}
                        </Link>
                    ))
                ),
            },
            {
                key: 'created_at',
                label: this.props.leadsStrings('tableHeaderDateCreated'),
                order: 7,
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
                order: 8,
                modifier: row => (
                    <div className={styles.confidentiality}>
                        {row.confidentiality}
                    </div>
                ),
            },
            {
                key: 'status',
                label: this.props.leadsStrings('tableHeaderStatus'),
                sortable: true,
                order: 9,
                modifier: row => (
                    <div className={styles.status}>
                        {row.status}
                    </div>
                ),
            },
            {
                key: 'no_of_entries',
                label: this.props.leadsStrings('tableHeaderNoOfEntries'),
                order: 10,
                sortable: true,
                modifier: row => row.noOfEntries,
            },
            {
                key: 'actions',
                label: this.props.leadsStrings('tableHeaderActions'),
                order: 11,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        leadsStrings={this.props.leadsStrings}
                        onSearchSimilarLead={this.handleSearchSimilarLead}
                        onRemoveLead={r => this.handleLeadAction(r, ACTION.delete)}
                        onMarkProcessed={r => this.handleLeadAction(r, ACTION.markAsProcessed)}
                        onMarkPending={r => this.handleLeadAction(r, ACTION.markAsPending)}
                        activeProject={this.props.activeProject}
                    />
                ),
            },
        ];

        this.state = {
            loadingLeads: false,
            redirectTo: undefined,

            leadAction: undefined,
            showModal: false,
            selectedLead: undefined,

            /*
            showDeleteModal: false,
            showStatusChangeModal: false,
            */
        };
    }

    componentWillMount() {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
            leadsPerPage,
        } = this.props;

        const request = new LeadsRequest({
            setState: params => this.setState(params),
            setLeads: this.props.setLeads,
        });

        this.leadRequest = request.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            leadsPerPage,
        });
        this.leadRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
            leadsPerPage,
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage ||
            this.props.leadsPerPage !== leadsPerPage
        ) {
            this.leadRequest.stop();


            const request = new LeadsRequest({
                setState: params => this.setState(params),
                setLeads: this.props.setLeads,
            });

            this.leadRequest = request.create({
                activeProject,
                activePage,
                activeSort,
                filters,
                leadsPerPage,
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

    // UI

    handleSearchSimilarLead = (row) => {
        this.props.setLeadPageFilter({
            filters: {
                ...this.props.filters,
                similar: row.id,
            },
        });
    };

    handleLeadAction= (row, action) => {
        this.setState({
            selectedLead: row,
            leadAction: action,
            showModal: true,
        });
    }

    handleModalClose = (confirm) => {
        if (confirm) {
            const { leadAction, selectedLead } = this.state;
            switch (leadAction) {
                case ACTION.delete: {
                    if (this.leadDeleteRequest) {
                        this.leadDeleteRequest.stop();
                    }
                    const request = new DeleteLeadRequest({
                        setState: params => this.setState(params),
                        removeLead: this.props.removeLead,
                        leadsStrings: this.props.leadsStrings,
                    });
                    this.leadDeleteRequest = request.create(selectedLead);
                    this.leadDeleteRequest.start();
                    break;
                }
                case ACTION.markAsPending: {
                    if (this.leadEditRequest) {
                        this.leadEditRequest.stop();
                    }
                    const request = new PatchLeadRequest({
                        setState: params => this.setState(params),
                        patchLead: this.props.patchLead,
                    });
                    this.leadEditRequest = request.create(selectedLead, { status: 'pending' });
                    this.leadEditRequest.start();
                    break;
                }
                case ACTION.markAsProcessed: {
                    if (this.leadEditRequest) {
                        this.leadEditRequest.stop();
                    }
                    const request = new PatchLeadRequest({
                        setState: params => this.setState(params),
                        patchLead: this.props.patchLead,
                    });
                    this.leadEditRequest = request.create(selectedLead, { status: 'processed' });
                    this.leadEditRequest.start();
                    break;
                }
                default:
                    break;
            }
        }

        this.setState({
            showModal: false,
            selectedLead: undefined,
            leadAction: undefined,
        });
    }

    handlePageClick = (page) => {
        this.props.setLeadPageActivePage({ activePage: page });
    }

    handleLeadsPerPageChange = (pageCount) => {
        this.props.setLeadsPerPage({ leadsPerPage: pageCount });
    }

    // TABLE

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
                <div className={styles.iconWrapper}>
                    <i className={icon} />
                </div>
            );
        }
        return (
            <div className={styles.iconWrapper}>
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
                    <span className={styles.label}>
                        Leads per page
                    </span>
                    <SelectInput
                        className={styles.leadsPerPageInput}
                        hideClearButton
                        showLabel={false}
                        showHintAndError={false}
                        options={Leads.leadsPerPageOptions}
                        value={this.props.leadsPerPage}
                        onChange={this.handleLeadsPerPageChange}
                    />
                </div>
                <div className={styles.pagerContainer}>
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={totalLeadsCount}
                        maxItemsPerPage={this.props.leadsPerPage}
                        onPageClick={this.handlePageClick}
                    />
                </div>
            </footer>
        );
    }

    render() {
        const {
            loadingLeads,
            showModal,
            redirectTo,
            leadAction,
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

        const getModalText = (action) => {
            switch (action) {
                case ACTION.delete:
                    return this.props.leadsStrings('leadDeleteConfirmText');
                case ACTION.markAsPending:
                    // FIXME: Use strings
                    return 'Do you want to mark the lead as pending?';
                case ACTION.markAsProcessed:
                    // FIXME: Use strings
                    return 'Do you want to mark the lead as processed?';
                default:
                    // FIXME: Use strings
                    return 'Are you sure?';
            }
        };

        return (
            <div className={styles.leads}>
                <Header />
                <div className={styles.tableContainer}>
                    <div className={styles.scrollWrapper}>
                        <RawTable
                            data={this.props.leads}
                            dataModifier={this.leadModifier}
                            headerModifier={this.headerModifier}
                            headers={this.headers}
                            onHeaderClick={this.handleTableHeaderClick}
                            keyExtractor={Leads.leadKeyExtractor}
                            className={styles.leadsTable}
                        />
                        { loadingLeads && <LoadingAnimation large /> }
                    </div>
                </div>
                <Footer />
                <Confirm
                    show={showModal}
                    closeOnEscape
                    onClose={this.handleModalClose}
                >
                    <p>
                        {getModalText(leadAction)}
                    </p>
                </Confirm>
            </div>
        );
    }
}
