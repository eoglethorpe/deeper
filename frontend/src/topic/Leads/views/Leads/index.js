import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Confirm,
    FormattedDate,
    LoadingAnimation,
    Pager,
    RawTable,
    TableHeader,
} from '../../../../public/components/View';
import {
    PrimaryButton,
    AccentButton,
    Button,
    DangerButton,
} from '../../../../public/components/Action';

import {
    reverseRoute,
    randomString,
} from '../../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadsOfProject,
    createUrlForLeadDelete,
    createParamsForLeadDelete,
    transformResponseErrorToFormError,
} from '../../../../common/rest';
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

    addLeadViewAddLeadsAction,
} from '../../../../common/redux';

import schema from '../../../../common/schema';

import { leadTypeIconMap } from '../../../../common/entities/lead';

import {
    iconNames,
    pathNames,
    leadsString,
} from '../../../../common/constants/';
import notify from '../../../../common/notify';

import FilterLeadsForm from './components/FilterLeadsForm';

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
    addLeads: PropTypes.func.isRequired,
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
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),

    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
});

const MAX_LEADS_PER_REQUEST = 24;

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // REST UTILS
    // TODO: move this somewhere
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

        this.headers = [
            {
                key: 'attachmentMimeType',
                label: leadsString.filterSourceType,
                order: 1,
                sortable: false,
                modifier: (row) => {
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
                },
            },
            {
                key: 'title',
                label: leadsString.titleLabel,
                order: 2,
                sortable: true,
            },
            {
                key: 'source',
                label: leadsString.tableHeaderPublisher,
                order: 3,
                sortable: true,
            },
            {
                key: 'published_on',
                label: leadsString.tableHeaderDatePublished,
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
                label: leadsString.tableHeaderOwner,
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
                label: leadsString.tableHeaderDateCreated,
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
                label: leadsString.tableHeaderConfidentiality,
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
                label: leadsString.tableHeaderStatus,
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
                label: leadsString.tableHeaderNoOfEntries,
                order: 9,
                sortable: true,
                modifier: row => row.noOfEntries,
            },
            {
                key: 'actions',
                label: leadsString.tableHeaderActions,
                order: 10,
                sortable: false,
                modifier: row => (
                    <div>
                        <Button
                            title={leadsString.searchSimilarLeadButtonTitle}
                            onClick={() => this.handleSearchSimilarLead(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.search} />
                        </Button>
                        <Button
                            title={leadsString.editLeadButtonTitle}
                            onClick={() => this.handleEditLeadClick(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.edit} />
                        </Button>
                        <DangerButton
                            title={leadsString.removeLeadLeadButtonTitle}
                            onClick={() => this.handleRemoveLead(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.delete} />
                        </DangerButton>
                        <AccentButton
                            title={leadsString.addEntryFromLeadButtonTitle}
                            onClick={() => this.handleAddEntryClick(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.forward} />
                        </AccentButton>
                    </div>
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

        // TODO: add required fields only
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
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
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
                    message: leadsString.leadDeleteSuccess,
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
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: leadsString.leadDelete,
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: leadsString.leadDelete,
                    type: notify.type.ERROR,
                    message: leadsString.leadDeleteFailure,
                    duration: notify.duration.MEDIUM,
                });
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

        this.setState({ redirectTo: reverseRoute(pathNames.editEntries, params) });
    }

    handleEditLeadClick = (row) => {
        const newLeads = [];

        const type = row.sourceType;
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

            pristine: true,
        });
        this.props.addLeads(newLeads);

        this.handleAddLeadClick();
    }

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

    render() {
        const {
            totalLeadsCount,
            activePage,
            activeProject,
        } = this.props;

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

        return (
            <div styleName="leads">
                <header styleName="header">
                    <FilterLeadsForm styleName="filters" />
                    <PrimaryButton
                        styleName="add-lead-button"
                        onClick={this.handleAddLeadClick}
                        iconName={iconNames.add}
                    >
                        {leadsString.addSourcesButtonLabel}
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
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.handleDeleteModalClose}
                >
                    <p>
                        {leadsString.leadDeleteConfirmText}
                    </p>
                </Confirm>
                <footer styleName="footer">
                    <div styleName="link-container">
                        <Link
                            styleName="link"
                            to={reverseRoute(pathNames.leadsViz, { projectId: activeProject })}
                            replace
                        >
                            Show Visualization
                        </Link>
                    </div>
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
