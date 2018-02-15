import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import {
    reverseRoute,
    randomString,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Pager from '../../vendor/react-store/components/View/Pager';
import RawTable from '../../vendor/react-store/components/View/RawTable';
import TableHeader from '../../vendor/react-store/components/View/TableHeader';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import Button from '../../vendor/react-store/components/Action/Button';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import BoundError from '../../components/BoundError';

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

    addLeadViewAddLeadsAction,
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
    addLeads: PropTypes.func.isRequired,

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

    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
});

const MAX_LEADS_PER_REQUEST = 24;

@BoundError
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
                label: this.props.leadsStrings('filterSourceType'),
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
                    <div>
                        <Button
                            title={this.props.leadsStrings('searchSimilarLeadButtonTitle')}
                            onClick={() => this.handleSearchSimilarLead(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.search} />
                        </Button>
                        <Button
                            title={this.props.leadsStrings('editLeadButtonTitle')}
                            onClick={() => this.handleEditLeadClick(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.edit} />
                        </Button>
                        <DangerButton
                            title={this.props.leadsStrings('removeLeadLeadButtonTitle')}
                            onClick={() => this.handleRemoveLead(row)}
                            smallVerticalPadding
                            transparent
                        >
                            <i className={iconNames.delete} />
                        </DangerButton>
                        <AccentButton
                            title={this.props.leadsStrings('addEntryFromLeadButtonTitle')}
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
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: this.props.leadsStrings('leadDelete'),
                    type: notify.type.ERROR,
                    message,
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

        const values = {
            title: row.title,
            sourceType: row.sourceType,
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
                        {this.props.leadsStrings('addSourcesButtonLabel')}
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
                        {this.props.leadsStrings('leadDeleteConfirmText')}
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