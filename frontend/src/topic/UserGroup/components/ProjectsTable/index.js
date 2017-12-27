import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Confirm,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    FormattedDate,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../../public/components/Action';
import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../../public/utils/common';

import {
    iconNames,
    notificationStrings,
    pathNames,
} from '../../../../common/constants';
import {
    userGroupProjectSelector,
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

import schema from '../../../../common/schema';
import notify from '../../../../common/notify';

import UserProjectAdd from '../../../../common/components/UserProjectAdd';
import styles from './styles.scss';

const propTypes = {
    // match required by selectors
    match: PropTypes.object.isRequired, // eslint-disable-line
    userGroup: PropTypes.object.isRequired, // eslint-disable-line
    projects: PropTypes.array.isRequired,// eslint-disable-line
    setUserGroupProject: PropTypes.func.isRequired, // eslint-disable-line
    unSetProject: PropTypes.func.isRequired, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projects: userGroupProjectSelector(state, props),
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
            confirmText: '',
            deletePending: false,
            selectedProject: {},
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
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'startDate',
                label: 'Start Date',
                order: 3,
                modifier: row => <FormattedDate date={row.startDate} mode="dd-MM-yyyy hh:mm" />,
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
                modifier: row => <FormattedDate date={row.modifiedAt} mode="dd-MM-yyyy hh:mm" />,
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
                    <div>
                        {
                            this.props.isCurrentUserAdmin &&
                            <TransparentDangerButton
                                title="Delete Project"
                                onClick={() => this.handleDeleteProjectClick(row)}

                            >
                                <i className={iconNames.delete} />
                            </TransparentDangerButton>
                        }
                        <Link
                            title="View Project"
                            key={row.id}
                            to={reverseRoute(pathNames.projects, { projectId: row.id })}
                        >
                            <TransparentPrimaryButton>
                                <span className={iconNames.openLink} />
                            </TransparentPrimaryButton>
                        </Link>
                    </div>
                ),
            },
        ];
    }

    componentWillMount() {
        this.requestForUserGroupProjects = this.createRequestForUserGroupProjects(
            this.props.userGroup.id,
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
        const userGroupRequest = new FgRestBuilder()
            .url(urlForUserGroupProjects)
            .params(() => createParamsForUser())
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

        const projectDeleteRequest = new FgRestBuilder()
            .url(urlForProject)
            .params(() => createParamsForProjectDelete())
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
                    notify.send({
                        title: notificationStrings.userProjectDelete,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userProjectDeleteSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.setState({ showDeleteProjectModal: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.userProjectDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userProjectDeleteFailure,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return projectDeleteRequest;
    }

    handleDeleteProjectClick = (project) => {
        const confirmText = `Are you sure you want to delete
            the project ${project.title}?`;

        this.setState({
            showDeleteProjectModal: true,
            selectedProject: project,
            confirmText,
        });
    };

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
        this.setState({ showDeleteProjectModal: false });
    }

    handleAddProjectClick = () => {
        this.setState({ showAddProjectModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddProjectModal: false });
    }

    handleSearchProjectChange = (value) => {
        const { projects } = this.props;
        const newProjects = projects.filter(
            project => caseInsensitiveSubmatch(project.title, value),
        );
        this.setState({
            searchProjectInputValue: value,
            projects: newProjects,
        });
    }

    keyExtractor = rowData => rowData.id

    render() {
        const { userGroup } = this.props;

        const {
            deletePending,
            showAddProjectModal,
            showDeleteProjectModal,
            projects,
            searchProjectInputValue,
            confirmText,
        } = this.state;

        return (
            <div styleName="projects">
                {deletePending && <LoadingAnimation /> }
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
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddProjectModalClose}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <UserProjectAdd
                            userGroups={[userGroup]}
                            handleModalClose={this.handleAddProjectModalClose}
                        />
                    </ModalBody>
                </Modal>
                <Confirm
                    onClose={this.handleDeleteProjectClose}
                    show={showDeleteProjectModal}
                >
                    <p>{confirmText}</p>
                </Confirm>
            </div>
        );
    }
}
