import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
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
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';

import {
    userGroupProjectSelector,
    setUserProjectsAction,
    unSetProjectAction,
    activeUserSelector,
} from '../../../redux';
import {
    iconNames,
    pathNames,
} from '../../../constants';
import _ts from '../../../ts';

import UserProjectAdd from '../../../components/UserProjectAdd';
import UserGroupProjectsRequest from '../requests/UserGroupProjectsRequest';
import ProjectDeleteRequest from '../requests/ProjectDeleteRequest';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    userGroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUserGroupProject: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetProject: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
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
                label: _ts('user', 'tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('user', 'tableHeaderCreatedAt'),
                order: 2,
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'startDate',
                label: _ts('user', 'tableHeaderStartDate'),
                order: 3,
                modifier: row => <FormattedDate date={row.startDate} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'countries',
                label: _ts('user', 'tableHeaderCountries'),
                order: 4,
                sortable: true,
                modifier: d => ((d.regions || []).length),
                comparator: (a, b) => compareLength(a.regions, b.regions),
            },
            {
                key: 'status',
                label: _ts('user', 'tableHeaderStatus'),
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'modifiedAt',
                label: _ts('user', 'tableHeaderLastModifiedAt'),
                order: 6,
                modifier: row => <FormattedDate date={row.modifiedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'members',
                label: _ts('user', 'tableHeaderMembers'),
                order: 7,
                sortable: true,
                modifier: d => ((d.memberships || []).length),
                comparator: (a, b) => compareLength(a.memberships, b.memberships),
            },
            {
                key: 'actions',
                label: _ts('user', 'tableHeaderActions'),
                order: 8,
                modifier: row => (
                    <div>
                        <Link
                            title={_ts('user', 'viewProjectLinkTitle')}
                            key={row.id}
                            to={reverseRoute(pathNames.projects, { projectId: row.id })}
                            className={styles.link}
                        >
                            <span className={iconNames.openLink} />
                        </Link>
                        {
                            this.props.isCurrentUserAdmin &&
                            <DangerButton
                                title={_ts('user', 'deleteProjectLinkTitle')}
                                onClick={() => this.handleDeleteProjectClick(row)}
                                iconName={iconNames.delete}
                                smallVerticalPadding
                                transparent
                            />
                        }
                    </div>
                ),
            },
        ];
    }

    componentWillMount() {
        this.startRequestForUserGroupProjects(this.props.userGroup.id);
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

    startRequestForUserGroupProjects = (id) => {
        if (this.requestForUserGroupProjects) {
            this.requestForUserGroupProjects.stop();
        }
        const requestForUserGroupProjects = new UserGroupProjectsRequest({
            setUserGroupProject: this.props.setUserGroupProject,
        });
        this.requestForUserGroupProjects = requestForUserGroupProjects.create(id);
        this.requestForUserGroupProjects.start();
    }

    startRequestForProjectDelete = (id) => {
        if (this.projectDeleteRequest) {
            this.projectDeleteRequest.stop();
        }
        const { id: userId } = this.props.activeUser;
        const projectDeleteRequest = new ProjectDeleteRequest({
            unSetProject: this.props.unSetProject,
            setState: v => this.setState(v),
        });
        this.projectDeleteRequest = projectDeleteRequest.create({ id, userId });
        this.projectDeleteRequest.start();
    }

    handleDeleteProjectClick = (project) => {
        const confirmText = _ts('user', 'confirmTextDeleteProject', {
            title: project.title,
        });

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
            this.startRequestForProjectDelete(selectedProject.id);
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
            <div className={`${this.props.className} ${styles.projects}`}>
                {deletePending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {_ts('user', 'headerProjects')}
                    </h2>
                    <div className={styles.pusher} />
                    <SearchInput
                        placeholder={_ts('user', 'placeholderSearch')}
                        onChange={this.handleSearchProjectChange}
                        value={searchProjectInputValue}
                        className={styles.searchInput}
                        showLabel={false}
                        showHintAndError={false}
                    />
                    {
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddProjectClick}
                            title={_ts('user', 'addProjectButtonLabel')}
                        >
                            {_ts('user', 'addProjectButtonLabel')}
                        </PrimaryButton>
                    }
                </div>
                <div className={styles.content}>
                    <Table
                        data={projects}
                        headers={this.projectHeaders}
                        keyExtractor={this.keyExtractor}
                    />
                </div>
                { showAddProjectModal &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddProjectModalClose}
                    >
                        <ModalHeader
                            title={_ts('user', 'addProjectButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddProjectModalClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserProjectAdd
                                userGroups={[userGroup]}
                                handleModalClose={this.handleAddProjectModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
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
