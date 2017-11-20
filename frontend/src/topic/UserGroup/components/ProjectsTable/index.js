import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Table,
    Modal,
    ModalHeader,
    ModalBody,
} from '../../../../public/components/View';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    UserProjectAdd,
} from '../../../UserProfile/components';

import {
    userGroupProjectSelector,
    tokenSelector,
    setUserProjectsAction,
    unSetProjectAction,
    activeUserSelector,
} from '../../../../common/redux';
import {
    createUrlForUserGroupProjects,
    createParamsForUser,
    createParamsForProjectDelete,
    createUrlForProject,
} from '../../../../common/rest';

import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line
    projects: PropTypes.array.isRequired,// eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    setUserGroupProject: PropTypes.func.isRequired, // eslint-disable-line
    unSetProject: PropTypes.func.isRequired, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projects: userGroupProjectSelector(state, props),
    token: tokenSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroupProject: params => dispatch(setUserProjectsAction(params)),
    unSetProject: params => dispatch(unSetProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddProjectModal: false,
            showDeleteProjectModal: false,
            deletePending: false,
            activeProjectDelete: {},
            searchProjectInputValue: '',
            projects: this.props.projects,
        };

        this.projectHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'createdAt',
                label: 'Created at',
                order: 2,
            },
            {
                key: 'startDate',
                label: 'Start Date',
                order: 3,
            },
            {
                key: 'countries',
                label: 'Countries',
                order: 4,
                sortable: true,
                modifier: d => ((d.regions || []).length),
                comparator: (a, b) => (a.regions || []).length - (b.regions || []).length,
            },
            {
                key: 'status',
                label: 'Status',
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
                // sortable: true,
                // comparator: (a, b) => a.name.localeCompare(b.name),
            },
            {
                key: 'modifiedAt',
                label: 'Last Modified at',
                order: 6,
            },
            {
                key: 'members',
                label: 'Members',
                order: 7,
                sortable: true,
                modifier: d => ((d.memberships || []).length),
                comparator: (a, b) => (a.memberships || []).length - (b.memberships || []).length,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 8,
                modifier: row => (
                    <div className="actions">
                        {
                            this.props.isCurrentUserAdmin &&
                            <TransparentButton
                                title="Delete Project"
                                className="delete-btn"
                                onClick={() => this.handleDeleteProjectClick(row)}

                            >
                                <i className="ion-android-delete" />
                            </TransparentButton>
                        }
                        <Link
                            className="forward-btn"
                            title="View Project"
                            key={row.id}
                            to={`/${row.id}/projectpanel/`}
                        >
                            <i className="ion-forward" />
                        </Link>
                    </div>
                ),
            },
        ];
    }

    componentWillMount() {
        this.requestForUserGroupProjects = this.createRequestForUserGroupProjects(
            this.props.match.params.userGroupId,
        );
        this.requestForUserGroupProjects.start();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            projects: nextProps.projects,
        });
    }

    componentWillUnmount() {
        if (this.requestForUserGroupProjects) {
            this.requestForUserGroupProjects.stop();
        }
    }

    createRequestForUserGroupProjects = (id) => {
        const urlForUserGroupProjects = createUrlForUserGroupProjects(id);
        const userGroupRequest = new RestBuilder()
            .url(urlForUserGroupProjects)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUserGroupProject({
                        projects: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userGroupRequest;
    }

    createRequestForProjectDelete = (projectId) => {
        const urlForProject = createUrlForProject(projectId);

        const projectDeleteRequest = new RestBuilder()
            .url(urlForProject)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .success(() => {
                try {
                    this.props.unSetProject({
                        projectId,
                        userId: this.props.activeUser.userId,
                    });
                    this.setState({ showDeleteProjectModal: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return projectDeleteRequest;
    }

    handleDeleteProjectClick = (project) => {
        this.setState({
            activeProjectDelete: project,
            showDeleteProjectModal: true,
        });
    };

    handleDeleteProjectClose = () => {
        this.setState({ showDeleteProjectModal: false });
    }

    deleteActiveProject = () => {
        if (this.projectDeleteRequest) {
            this.projectDeleteRequest.stop();
        }

        const { activeProjectDelete } = this.state;
        this.projectDeleteRequest = this.createRequestForProjectDelete(
            activeProjectDelete.id,
        );
        this.projectDeleteRequest.start();
    }

    handleAddProjectClick = (row) => {
        this.setState({
            editRow: row,
            showAddProjectModal: true,
        });
    }

    handleAddProjectModalClose = () => {
        this.setState({
            // editRow: {},
            showAddProjectModal: false,
        });
    }

    applySearch = (projects, searchInputValue) => {
        const caseInsensitiveSubmatch = (str, value) => (
            !value || (str || '').toLowerCase().includes(
                (value || '').toLowerCase(),
            )
        );

        const newProjects = projects.filter(
            project => (
                caseInsensitiveSubmatch(
                    project.title,
                    searchInputValue,
                )
            ),
        );
        return newProjects;
    };

    handleSearchProjectChange = (value) => {
        this.setState({
            searchProjectInputValue: value,
            projects: this.applySearch(this.props.projects, value),
        });
    }

    keyExtractor = rowData => rowData.id

    render() {
        const { match } = this.props;

        const {
            activeProjectDelete,
            deletePending,
            showAddProjectModal,
            showDeleteProjectModal,
            projects,
            searchProjectInputValue,
        } = this.state;

        return (
            <div styleName="projects">
                <div styleName="header">
                    <TextInput
                        placeholder="Search Projects"
                        onChange={this.handleSearchProjectChange}
                        value={searchProjectInputValue}
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <div styleName="pusher" />
                    {
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddProjectClick}
                            title="Project"
                        >
                            Add New Project
                        </PrimaryButton>
                    }
                </div>
                <div styleName="content">
                    <Table
                        data={projects}
                        headers={this.projectHeaders}
                        keyExtractor={this.keyExtractor}
                    />
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddProjectModalClose}
                    show={showAddProjectModal}
                >
                    <ModalHeader
                        title="Add New Project"
                    />
                    <ModalBody>
                        <UserProjectAdd
                            userGroups={[match.params.userGroupId]}
                            handleModalClose={this.handleAddProjectModalClose}
                        />
                    </ModalBody>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteProjectClose}
                    show={showDeleteProjectModal}
                >
                    <ModalHeader title="Delete Project" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteProjectClose}
                            handleDelete={this.deleteActiveProject}
                            getName={() => (activeProjectDelete.title)}
                            getType={() => ('Project')}
                            pending={deletePending}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
