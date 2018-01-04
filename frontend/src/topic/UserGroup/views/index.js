import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Modal,
    ModalHeader,
    ModalBody,
    LoadingAnimation,
} from '../../../public/components/View';
import {
    TransparentPrimaryButton,
} from '../../../public/components/Action';
import styles from './styles.scss';

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
} from '../../../common/redux';

import {
    iconNames,
} from '../../../common/constants';

import {
    createParamsForUser,
    createUrlForUserGroup,
    createUrlForUsers,
} from '../../../common/rest';

import { FgRestBuilder } from '../../../public/utils/rest';
import schema from '../../../common/schema';

const propTypes = {
    userGroup: PropTypes.object, // eslint-disable-line
    setUserGroup: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
    unSetUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    userGroupId: PropTypes.string.isRequired,
};

const defaultProps = {
    userGroups: [],
    leads: [],
};

const mapStateToProps = (state, props) => ({
    userGroup: groupSelector(state, props),
    activeUser: activeUserSelector(state),
    userGroupId: groupIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    setUsers: params => dispatch(setUsersInformationAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

const emptyList = [];

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
                        User Group Not Found....
                    </div>
                </div>
            );
        }

        return (
            <div styleName="usergroup">
                <div styleName="info">
                    <div styleName="title">
                        <span styleName="name">{ userGroup.title }</span>
                        {
                            isCurrentUserAdmin &&
                            <TransparentPrimaryButton onClick={this.handleUserGroupEditClick}>
                                <span className={iconNames.edit} />
                            </TransparentPrimaryButton>
                        }
                    </div>
                </div>
                <div styleName="stats">
                    Activity Log
                </div>
                <ProjectsTable
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    userGroup={userGroup}
                />
                <MembersTable
                    memberData={userGroup.memberships || emptyList}
                    userGroupId={+userGroupId}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    activeUser={this.props.activeUser}
                />
                <Modal
                    closeOnEscape
                    onClose={this.handleUserGroupEditModalClose}
                    show={showUserGroupEditModal}
                    styleName="user-group-edit-modal"
                >
                    <ModalHeader
                        title={`Edit User Group: ${userGroup.title}`}
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleUserGroupEditModalClose}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <UserGroupEdit
                            userGroup={userGroup}
                            handleModalClose={this.handleUserGroupEditModalClose}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
