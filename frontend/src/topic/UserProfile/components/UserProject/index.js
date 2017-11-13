/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    PrimaryButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';

import {
    UserProjectAdd,
} from '../../components/';

import { RestBuilder } from '../../../../public/utils/rest';

import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import {
    createParamsForProjectDelete,
    createParamsForProjects,
    createUrlForProject,
    createUrlForProjectsOfUser,
} from '../../../../common/rest';

import {
    tokenSelector,
    userProjectsSelector,
    setUserProjectsAction,
    activeUserSelector,
    unSetProjectAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setUserProjects: PropTypes.func.isRequired,
    unSetProject: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userProjects: PropTypes.array, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    userProjects: [],
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userProjects: userProjectsSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserProjects: params => dispatch(setUserProjectsAction(params)),
    unSetProject: params => dispatch(unSetProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserProject extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addProject: false,

            // Delete Modal state
            deleteProject: false,
            deletePending: false,

            // Active Delete state
            activeProjectDelete: null,
        };

        // TABLE component
        this.projectTableHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 2,
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'createdAt',
                label: 'Created at',
                order: 3,
                sortable: true,
                comparator: (a, b) => a.createdAt - b.createdAt,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'modifiedAt',
                label: 'Last Modified at',
                order: 4,
                sortable: true,
                comparator: (a, b) => a.modifiedAt - b.modifiedAt,
                modifier: row => (
                    <FormattedDate
                        date={row.modifiedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'status',
                label: 'Status',
                order: 5,
                sortable: true,
                comparator: (a, b) => a.status.localeCompare(b.status),
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'members',
                label: 'Members',
                order: 6,
                sortable: true,
                comparator: (a, b) => a.memberships.length || [] - b.memberships.length || [],
                modifier: d => (d.memberships || []).length,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <TransparentButton
                                className="watch-btn"
                            >
                                <Link
                                    key={d.title}
                                    to={`/${d.id}/projectpanel/`}
                                >
                                    <i className="ion-eye" />
                                </Link>
                            </TransparentButton>
                        );
                    }

                    const onDeleteClick = () => this.handleDeleteProjectClick(d.id);
                    return (
                        <div>
                            <TransparentButton
                                className="edit-btn"
                            >
                                <Link
                                    key={d.title}
                                    to={`/${d.id}/projectpanel/`}
                                >
                                    <i className="ion-edit" />
                                </Link>
                            </TransparentButton>
                            <TransparentButton
                                onClick={onDeleteClick}
                                className="delete-btn"
                            >
                                <i className="ion-android-delete" />
                            </TransparentButton>
                        </div>
                    );
                },
            },
        ];
        this.projectTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props.match.params;
        this.projectsRequest = this.createRequestForProjects(userId);
        this.projectsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.projectsRequest.stop();
            this.projectsRequest = this.createRequestForProjects(userId);
            this.projectsRequest.start();
        }
    }

    componentWillUnmount() {
        this.projectsRequest.stop();
    }

    getActiveDeleteProjectType = () => 'Project'

    getActiveDeleteProjectName = () => {
        const { userProjects } = this.props;
        const project = userProjects.find(e => (
            e.id === this.state.activeProjectDelete
        ));
        return project ? project.title : null;
    }

    deleteActiveProject = () => {
        if (this.projectDeleteRequest) {
            this.projectDeleteRequest.stop();
        }

        const { activeProjectDelete } = this.state;
        this.projectDeleteRequest = this.createRequestForProjectDelete(
            activeProjectDelete,
        );
        this.projectDeleteRequest.start();
    }

    createRequestForProjectDelete = (projectId) => {
        const urlForProject = createUrlForProject(projectId);
        const userId = this.props.activeUser.userId;

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
            .success(() => {
                try {
                    this.props.unSetProject({
                        userId,
                        projectId,
                    });
                    this.setState({ deleteProject: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
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

    createRequestForProjects = (userId) => {
        const projectsRequest = new RestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjects({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUserProjects({
                        userId,
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
        return projectsRequest;
    }

    // BUTTONS

    handleAddProjectClick = () => {
        this.setState({ addProject: true });
    }

    handleAddProjectClose = () => {
        this.setState({ addProject: false });
    }

    // Table Actions

    // Delete Click
    handleDeleteProjectClick = (id) => {
        this.setState({
            deleteProject: true,
            activeProjectDelete: id,
        });
    }

    // Delete Close
    handleDeleteProjectClose = () => {
        this.setState({ deleteProject: false });
    }

    render() {
        const { userProjects, match, activeUser } = this.props;

        const {
            addProject,
            deleteProject,
            deletePending,
        } = this.state;

        const isCurrentUser = parseInt(match.params.userId, 10) === activeUser.userId;

        return (
            <div styleName="projects">
                <div styleName="header">
                    <h2>
                        Projects
                    </h2>
                    <div styleName="pusher" />
                    {

                        isCurrentUser &&
                        <div>
                            <PrimaryButton onClick={this.handleAddProjectClick} >
                                Add Project
                            </PrimaryButton>
                        </div>
                    }
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddProjectClose}
                    show={addProject}
                >
                    <ModalHeader title="Add Project" />
                    <ModalBody>
                        <UserProjectAdd handleModalClose={this.handleAddProjectClose} />
                    </ModalBody>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteProjectClose}
                    show={deleteProject}
                >
                    <ModalHeader title="Delete Project" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteProjectClose}
                            handleDelete={this.deleteActiveProject}
                            getName={this.getActiveDeleteProjectName}
                            getType={this.getActiveDeleteProjectType}
                            pending={deletePending}
                        />
                    </ModalBody>
                </Modal>
                <div styleName="projects-table">
                    <Table
                        data={userProjects}
                        headers={this.projectTableHeaders}
                        keyExtractor={this.projectTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
