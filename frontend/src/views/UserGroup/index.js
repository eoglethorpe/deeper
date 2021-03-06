import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import BoundError from '../../vendor/react-store/components/General/BoundError';

import AppError from '../../components/AppError';
import _ts from '../../ts';

import MembersTable from './MembersTable';
import ProjectsTable from './ProjectsTable';
import UserGroupEdit from './UserGroupEdit';

import {
    groupSelector,
    setUserGroupAction,
    unSetUserGroupAction,

    activeUserSelector,
    groupIdFromRouteSelector,
} from '../../redux';
import { iconNames } from '../../constants';

import UserGroupGetRequest from './requests/UserGroupGetRequest';

import styles from './styles.scss';

const propTypes = {
    userGroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setUserGroup: PropTypes.func.isRequired,
    unSetUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
};

const defaultProps = {};

const mapStateToProps = (state, props) => ({
    userGroup: groupSelector(state, props),
    activeUser: activeUserSelector(state),
    userGroupId: groupIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

const emptyList = [];

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showUserGroupEditModal: false,
            pending: true,
        };
    }

    componentWillMount() {
        const { userGroupId } = this.props;
        this.startRequestForUserGroup(userGroupId);
    }

    componentWillUnmount() {
        if (this.userGroupRequest) {
            this.userGroupRequest.stop();
        }
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
    }

    startRequestForUserGroup = (id) => {
        if (this.userGroupRequest) {
            this.userGroupRequest.stop();
        }
        const userGroupRequest = new UserGroupGetRequest({
            setUserGroup: this.props.setUserGroup,
            unSetUserGroup: this.props.unSetUserGroup,
            setState: v => this.setState(v),
        });
        this.userGroupRequest = userGroupRequest.create(id);
        this.userGroupRequest.start();
    }

    isCurrentUserAdmin = memberData => (
        memberData.findIndex(member => (
            member.role === 'admin' && member.member === this.props.activeUser.userId
        )) !== -1
    )

    handleUserGroupEditModalClose = () => {
        this.setState({ showUserGroupEditModal: false });
    }

    handleUserGroupEditClick = () => {
        this.setState({ showUserGroupEditModal: true });
    }

    render() {
        const {
            userGroup,
            userGroupId,
        } = this.props;
        const {
            showUserGroupEditModal,
            pending,
        } = this.state;

        const isCurrentUserAdmin = this.isCurrentUserAdmin(userGroup.memberships || emptyList);

        if (pending) {
            return (
                <div className={styles.usergroup}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!userGroup.id) {
            return (
                <div className={styles.usergroup}>
                    <div className={styles.usergroupAlt}>
                        {_ts('user', 'userGroupNotFound')}
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.usergroup}>
                <header className={styles.header}>
                    <h2>
                        {_ts('user', 'userGroupTitle')}
                    </h2>
                </header>
                <div className={styles.info}>
                    <div className={styles.titleContainer}>
                        <span className={styles.name}>{ userGroup.title }</span>
                        {
                            isCurrentUserAdmin &&
                                <PrimaryButton
                                    onClick={this.handleUserGroupEditClick}
                                    transparent
                                >
                                    <span className={iconNames.edit} />
                                </PrimaryButton>
                        }
                    </div>
                    <p className={styles.description}>
                        { userGroup.description }
                    </p>
                </div>
                <div className={styles.stats}>
                    <h2>
                        {_ts('user', 'userGroupActivtyLogTitle')}
                    </h2>
                </div>
                <ProjectsTable
                    className={styles.projects}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    userGroup={userGroup}
                />
                <MembersTable
                    className={styles.members}
                    memberData={userGroup.memberships || emptyList}
                    userGroupId={userGroupId}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    activeUser={this.props.activeUser}
                />
                { showUserGroupEditModal &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleUserGroupEditModalClose}
                        className={styles.userGroupEditModal}
                    >
                        <ModalHeader
                            title={_ts('user', 'userGroupEditModalLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleUserGroupEditModalClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserGroupEdit
                                userGroup={userGroup}
                                handleModalClose={this.handleUserGroupEditModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
