/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <ayernavin@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareDate,
    compareLength,
    compareString,
} from '../../../vendor/react-store/utils/common';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../../vendor/react-store/components/View/FormattedDate';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import Table from '../../../vendor/react-store/components/View/Table';

import {
    userProjectsSelector,
    setUserProjectsAction,
    activeUserSelector,
    unSetProjectAction,
    userIdFromRouteSelector,

    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';
import {
    iconNames,
    pathNames,
} from '../../../constants';
import UserProjectAdd from '../../../components/UserProjectAdd';

import UserProjectsGetRequest from '../requests/UserProjectsGetRequest';
import ProjectDeleteRequest from '../requests/ProjectDeleteRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    setUserProjects: PropTypes.func.isRequired,
    unSetProject: PropTypes.func.isRequired,
    userProjects: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userId: PropTypes.number.isRequired,

    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    userProjects: [],
};

const mapStateToProps = (state, props) => ({
    userProjects: userProjectsSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),

    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserProjects: params => dispatch(setUserProjectsAction(params)),
    unSetProject: params => dispatch(unSetProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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
                label: this.props.userStrings('tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'rights',
                label: this.props.userStrings('tableHeaderRights'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
                modifier: row => row.role,
            },
            {
                key: 'createdAt',
                label: this.props.userStrings('tableHeaderCreatedAt'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareDate(a.createdAt, b.createdAt),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'modifiedAt',
                label: this.props.userStrings('tableHeaderLastModifiedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.modifiedAt, b.modifiedAt),
                modifier: row => (
                    <FormattedDate
                        date={row.modifiedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'status',
                label: this.props.userStrings('tableHeaderStatus'),
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'members',
                label: this.props.userStrings('tableHeaderMembers'),
                order: 6,
                sortable: true,
                comparator: (a, b) => compareLength(a.memberships, b.memberships),
                modifier: d => (d.memberships || []).length,
            },
            {
                key: 'actions',
                label: this.props.userStrings('tableHeaderActions'),
                order: 7,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <Link
                                title={this.props.userStrings('viewProjectLinkTitle')}
                                to={reverseRoute(pathNames.projects, { projectId: d.id })}
                                className={styles.link}
                            >
                                <span className={iconNames.openLink} />
                            </Link>
                        );
                    }

                    return ([
                        <Link
                            title={this.props.userStrings('editProjectLinkTitle')}
                            key="project-panel"
                            to={reverseRoute(pathNames.projects, { projectId: d.id })}
                            className={styles.link}
                        >
                            <span className={iconNames.edit} />
                        </Link>,
                        <DangerButton
                            title={this.props.userStrings('deleteProjectLinkTitle')}
                            key="delete"
                            onClick={() => this.handleDeleteProjectClick(d)}
                            iconName={iconNames.delete}
                            smallVerticalPadding
                            transparent
                        />,
                    ]);
                },
            },
        ];
        this.projectTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props;
        this.startRequestForProjects(userId);
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.startRequestForProjects(userId);
        }
    }

    componentWillUnmount() {
        this.projectsRequest.stop();
    }

    startRequestForProjects = (userId) => {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
        const projectsRequest = new UserProjectsGetRequest({
            setUserProjects: this.props.setUserProjects,
            // setState: v => this.setState(v),
        });
        this.projectsRequest = projectsRequest.create(userId);
        this.projectsRequest.start();
    }

    startRequestForProjectDelete = (projectId, userId) => {
        if (this.projectDeleteRequest) {
            this.projectDeleteRequest.stop();
        }
        const projectDeleteRequest = new ProjectDeleteRequest({
            unSetProject: this.props.unSetProject,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.projectDeleteRequest = projectDeleteRequest.create({ projectId, userId });
        this.projectDeleteRequest.start();
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
        const confirmText = this.props.userStrings('confirmTextDeleteProject', {
            title: project.title,
        });

        this.setState({
            deleteProject: true,
            selectedProject: project,
            confirmText,
        });
    }

    // Delete Close
    handleDeleteProjectClose = (confirm) => {
        if (confirm) {
            const { selectedProject } = this.state;
            const { userId } = this.props.activeUser;
            this.startRequestForProjectDelete(selectedProject.id, userId);
        }
        this.setState({ deleteProject: false });
    }

    render() {
        const {
            className,
            userProjects,
            userId,
            activeUser,
        } = this.props;

        const {
            addProject,
            deleteProject,
            deletePending,
            confirmText,
        } = this.state;

        const isCurrentUser = userId === activeUser.userId;

        return (
            <div className={`${styles.projects} ${className}`}>
                { deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {this.props.userStrings('headerProjects')}
                    </h2>
                    {

                        isCurrentUser && (
                            <PrimaryButton onClick={this.handleAddProjectClick} >
                                {this.props.userStrings('addProjectButtonLabel')}
                            </PrimaryButton>
                        )
                    }
                </div>
                { addProject &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddProjectClose}
                    >
                        <ModalHeader
                            title={this.props.userStrings('addProjectButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddProjectClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserProjectAdd handleModalClose={this.handleAddProjectClose} />
                        </ModalBody>
                    </Modal>
                }
                <Confirm
                    onClose={this.handleDeleteProjectClose}
                    show={deleteProject}
                >
                    <p>{confirmText}</p>
                </Confirm>
                <div className={styles.projectsTable}>
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
