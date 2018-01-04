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
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../../public/components/Action';
import {
    Confirm,
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
    LoadingAnimation,
} from '../../../../public/components/View';

import { FgRestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';
import {
    iconNames,
    notificationStrings,
    pathNames,
} from '../../../../common/constants';

import schema from '../../../../common/schema';

import {
    createParamsForProjectDelete,
    createParamsForProjects,
    createUrlForProject,
    createUrlForProjectsOfUser,
} from '../../../../common/rest';

import {
    userProjectsSelector,
    setUserProjectsAction,
    activeUserSelector,
    unSetProjectAction,
    userIdFromRouteSelector,
} from '../../../../common/redux';

import UserProjectAdd from '../../../../common/components/UserProjectAdd';
import notify from '../../../../common/notify';

import styles from './styles.scss';

const propTypes = {
    setUserProjects: PropTypes.func.isRequired,
    unSetProject: PropTypes.func.isRequired,
    userProjects: PropTypes.array, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    userId: PropTypes.string.isRequired,
};

const defaultProps = {
    userProjects: [],
};


const mapStateToProps = (state, props) => ({
    userProjects: userProjectsSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
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
            confirmText: '',

            // Active Delete state
            selectedProject: null,
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
                sortable: true,
                comparator: (a, b) => a.role.localeCompare(b.role),
                modifier: row => row.role,
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
                                to={reverseRoute(pathNames.projects, { projectId: d.id })}
                            >
                                <TransparentPrimaryButton>
                                    <span className={iconNames.openLink} />
                                </TransparentPrimaryButton>
                            </Link>
                        );
                    }

                    return ([
                        <Link
                            title="Edit Project"
                            key="project-panel"
                            to={reverseRoute(pathNames.projects, { projectId: d.id })}
                        >
                            <TransparentPrimaryButton>
                                <span className={iconNames.edit} />
                            </TransparentPrimaryButton>
                        </Link>,
                        <TransparentDangerButton
                            key="delete"
                            title="Delete Project"
                            onClick={() => this.handleDeleteProjectClick(d)}
                        >
                            <i className={iconNames.delete} />
                        </TransparentDangerButton>,
                    ]);
                },
            },
        ];
        this.projectTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props;
        this.projectsRequest = this.createRequestForProjects(userId);
        this.projectsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.projectsRequest.stop();
            this.projectsRequest = this.createRequestForProjects(userId);
            this.projectsRequest.start();
        }
    }

    componentWillUnmount() {
        this.projectsRequest.stop();
    }

    createRequestForProjectDelete = (projectId) => {
        const urlForProject = createUrlForProject(projectId);
        const userId = this.props.activeUser.userId;

        const projectDeleteRequest = new FgRestBuilder()
            .url(urlForProject)
            .params(() => createParamsForProjectDelete())
            .success(() => {
                try {
                    this.props.unSetProject({
                        userId,
                        projectId,
                    });
                    notify.send({
                        title: notificationStrings.userProjectDelete,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userProjectDeleteSuccess,
                        duration: notify.duration.MEDIUM,
                    });
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
            .failure(() => {
                notify.send({
                    title: notificationStrings.userProjectDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userProjectDeleteFailure,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.userProjectDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userProjectDeleteFatal,
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return projectDeleteRequest;
    }

    createRequestForProjects = (userId) => {
        const projectsRequest = new FgRestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => createParamsForProjects())
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
    handleDeleteProjectClick = (project) => {
        const confirmText = `Are you sure you want to delete the project
            ${project.title}?`;

        this.setState({
            deleteProject: true,
            selectedProject: project,
            confirmText,
        });
    }

    // Delete Close
    handleDeleteProjectClose = (confirm) => {
        if (confirm) {
            if (this.projectDeleteRequest) {
                this.projectDeleteRequest.stop();
            }

            const { selectedProject } = this.state;
            this.projectDeleteRequest = this.createRequestForProjectDelete(
                selectedProject.id,
            );
            this.projectDeleteRequest.start();
        }
        this.setState({ deleteProject: false });
    }

    render() {
        const { userProjects, userId, activeUser } = this.props;

        const {
            addProject,
            deleteProject,
            deletePending,
            confirmText,
        } = this.state;

        const isCurrentUser = +userId === activeUser.userId;

        return (
            <div styleName="projects">
                {deletePending && <LoadingAnimation />}
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
                    <ModalHeader
                        title="Add Project"
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddProjectClose}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <UserProjectAdd handleModalClose={this.handleAddProjectClose} />
                    </ModalBody>
                </Modal>
                <Confirm
                    onClose={this.handleDeleteProjectClose}
                    show={deleteProject}
                >
                    <p>{confirmText}</p>
                </Confirm>
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
