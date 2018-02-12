import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import PrimaryButton from '../../../public/components/Action/Button/PrimaryButton';
import Modal from '../../../public/components/View/Modal';
import ModalBody from '../../../public/components/View/Modal/Body';
import ModalHeader from '../../../public/components/View/Modal/Header';
import LoadingAnimation from '../../../public/components/View/LoadingAnimation';
import BoundError from '../../../common/components/BoundError';

import MembersTable from '../components/MembersTable';
import ProjectsTable from '../components/ProjectsTable';
import UserGroupEdit from '../components/UserGroupEdit';

import {
    groupSelector,
    setUserGroupAction,
    setUsersInformationAction,
    unSetUserGroupAction,

    activeUserSelector,
    groupIdFromRouteSelector,
    userStringsSelector,
} from '../../../common/redux';
import {
    createParamsForUser,
    createUrlForUserGroup,
    createUrlForUsers,
} from '../../../common/rest';
import { iconNames } from '../../../common/constants';
import schema from '../../../common/schema';

import styles from './styles.scss';

const propTypes = {
    userGroup: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setUserGroup: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
    unSetUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.string.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    userGroup: groupSelector(state, props),
    activeUser: activeUserSelector(state),
    userGroupId: groupIdFromRouteSelector(state, props),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    setUsers: params => dispatch(setUsersInformationAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

const emptyList = [];

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { userGroupId } = this.props;

        this.state = {
            showUserGroupEditModal: false,
            pending: true,
        };

        this.usersFields = ['display_name', 'email', 'id'];

        this.userGroupRequest = this.createRequestForUserGroup(userGroupId);
        this.usersRequest = this.createRequestForUsers();
    }

    componentWillMount() {
        this.userGroupRequest.start();
        this.usersRequest.start();
    }

    componentWillUnmount() {
        this.userGroupRequest.stop();
        this.usersRequest.stop();
    }

    createRequestForUserGroup = (id) => {
        const urlForUserGroup = createUrlForUserGroup(id);
        const userGroupRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupGetResponse');
                    this.props.setUserGroup({
                        userGroup: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                if (response.errorCode === 404) {
                    this.props.unSetUserGroup({ userGroupId: id });
                } else {
                    console.info('FAILURE:', response);
                }
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userGroupRequest;
    }

    createRequestForUsers = () => {
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers([this.usersFields]))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'usersGetResponse');
                    this.props.setUsers({
                        users: response.results,
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
        return usersRequest;
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
        const { userGroup, userGroupId } = this.props;
        const { showUserGroupEditModal, pending } = this.state;

        const isCurrentUserAdmin = this.isCurrentUserAdmin(userGroup.memberships || emptyList);

        if (pending) {
            return (
                <div styleName="usergroup">
                    <LoadingAnimation />
                </div>
            );
        }

        if (!userGroup.id) {
            return (
                <div styleName="usergroup">
                    <div styleName="usergroup-alt">
                        {this.props.userStrings('userGroupNotFound')}
                    </div>
                </div>
            );
        }

        return (
            <div styleName="usergroup">
                <header styleName="header">
                    <h2>
                        {this.props.userStrings('userGroupTitle')}
                    </h2>
                </header>
                <div styleName="info">
                    <div styleName="title-container">
                        <span styleName="name">{ userGroup.title }</span>
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
                    <p styleName="description">
                        { userGroup.description }
                    </p>
                </div>
                <div styleName="stats">
                    <h2>
                        {this.props.userStrings('userGroupActivtyLogTitle')}
                    </h2>
                </div>
                <ProjectsTable
                    styleName="projects"
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    userGroup={userGroup}
                />
                <MembersTable
                    styleName="members"
                    memberData={userGroup.memberships || emptyList}
                    userGroupId={userGroupId}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    activeUser={this.props.activeUser}
                />
                { showUserGroupEditModal &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleUserGroupEditModalClose}
                        styleName="user-group-edit-modal"
                    >
                        <ModalHeader
                            title={`${this.props.userStrings('userGroupEditModalLabel')}: ${userGroup.title}`}
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
