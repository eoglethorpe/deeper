import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import EditLeadForm from '../components/EditLeadForm';
import FilterLeadsForm from '../components/FilterLeadsForm';
import FormattedDate from '../../../public/components/FormattedDate';
import RawTable from '../../../public/components/RawTable';
import browserHistory from '../../../common/browserHistory';
import styles from './styles.scss';
import Modal, { Header, Body } from '../../../public/components/Modal';
import { RestBuilder } from '../../../public/utils/rest';
import { pageTitles } from '../../../common/utils/labels';
import {
    PrimaryButton,
    TransparentAccentButton,
    TransparentButton,
} from '../../../public/components/Button';
import {
    createParamsForUser,
    createUrlForLeadsOfProject,
} from '../../../common/rest';
import {
    tokenSelector,
} from '../../../common/selectors/auth';
import {
    activeProjectSelector,
    currentUserActiveProjectSelector,
    leadsForProjectSelector,
} from '../../../common/selectors/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    setLeadsAction,
} from '../../../common/action-creators/domainData';

import schema from '../../../common/schema';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
    leads: PropTypes.array, // eslint-disable-line
    setLeads: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    leads: [],
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    currentUserActiveProject: currentUserActiveProjectSelector(state),
    leads: leadsForProjectSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'createdAt',
                label: 'Created at',
                order: 1,
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'createdBy',
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
                key: 'publishedOn',
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
                key: 'noOfEntries',
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
        ];

        this.filters = [];

        this.state = {
            editRow: {},
            showEditLeadModal: false,
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
        this.leadRequest = this.createRequestForProjectLeads(activeProject);
        this.leadRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject } = nextProps;
        if (this.props.activeProject !== activeProject) {
            this.leadRequest.stop();

            this.leadRequest = this.createRequestForProjectLeads(activeProject);
            this.leadRequest.start();
        }
    }

    componentWillUnmount() {
        this.leadRequest.stop();
    }

    createRequestForProjectLeads = (activeProject) => {
        const { filters } = this;
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            ...filters,
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
            .success((response) => {
                try {
                    schema.validate(response, 'leadsGetResponse');
                    this.props.setLeads({
                        projectId: activeProject,
                        leads: response.results,
                    });
                    console.log(response);
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
        const header = this.headers.find(d => d.key === columnKey);

        if (header.modifier) {
            return header.modifier(lead);
        }

        return lead[columnKey];
    }

    handleAddLeadClick = () => {
        browserHistory.push(`/${this.props.activeProject}/leads/new/`);
    }

    handleApplyFilters = (filters) => {
        const { activeProject } = this.props;

        this.filters = filters;

        this.leadRequest = this.createRequestForProjectLeads(activeProject);
        this.leadRequest.start();
    }


    render() {
        console.log('Rendering Leads');

        const { currentUserActiveProject } = this.props;
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
                        headers={this.headers}
                        keyExtractor={this.leadKeyExtractor}
                        styleName="leads-table"
                    />
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleEditLeadModalClose}
                    show={this.state.showEditLeadModal}
                >
                    <Header
                        title="Edit lead"
                    />
                    <Body>
                        <EditLeadForm
                            onSubmit={() => {}}
                            pending={false}
                            values={this.state.editRow}
                        />
                    </Body>
                </Modal>
            </div>
        );
    }
}
