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
import { FgRestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';
import {
    pathNames,
} from '../../../../common/constants';

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


import {
    UserProjectAdd,
} from '../../components/';

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

// TODO: move this to common
const dateComparator = (a, b) => {
    if (!a && !b) {
        return 1;
    } else if (!a) {
        return -1;
    } else if (!b) {
        return 1;
    }
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
};

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
                comparator: (a, b) => dateComparator(a.createdAt, b.createdAt),
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
                comparator: (a, b) => dateComparator(a.modifiedAt, b.modifiedAt),
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
                            <Link
                                title="View Project"
                                className={`
                                    ${styles['link-to-project']}
                                    ${styles['action-button']}
                                `}
                                to={reverseRoute(pathNames.projects, { projectId: d.id })}
                            >
                                <span className="ion-android-open" />
                            </Link>
                        );
                    }

                    const onDeleteClick = () => this.handleDeleteProjectClick(d.id);
                    return ([
                        <Link
                            title="Edit Project"
                            className={`
                                ${styles['link-to-project']}
                                ${styles['action-button']}
                            `}
                            key="project-panel"
                            to={reverseRoute(pathNames.projects, { projectId: d.id })}
                        >
                            <i className="ion-edit" />
                        </Link>,
                        <TransparentButton
                            key="delete"
                            title="Delete Project"
                            className={`
                                ${styles['delete-btn']}
                                ${styles['action-button']}
                            `}
                            onClick={onDeleteClick}
                        >
                            <i className="ion-android-delete" />
                        </TransparentButton>,
                    ]);
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

        const projectDeleteRequest = new FgRestBuilder()
            .url(urlForProject)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectDelete({ access });
            })
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
        const projectsRequest = new FgRestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjects({ access });
            })
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

        const isCurrentUser = +match.params.userId === activeUser.userId;

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
                    styleName="delete-confirm-modal"
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
