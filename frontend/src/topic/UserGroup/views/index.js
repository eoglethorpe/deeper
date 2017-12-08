import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import {
    Modal,
    ModalHeader,
    ModalBody,
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

    tokenSelector,
    activeUserSelector,
} from '../../../common/redux';

import {
    createParamsForUser,
    createUrlForUserGroup,
    createUrlForUsers,
} from '../../../common/rest';

import { FgRestBuilder } from '../../../public/utils/rest';
import schema from '../../../common/schema';

const propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    userGroup: PropTypes.object, // eslint-disable-line
    setUserGroup: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    userGroups: [],
    leads: [],
};

const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userGroup: groupSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    setUsers: params => dispatch(setUsersInformationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { match } = props;
        const userGroupId = match.params.userGroupId;

        this.state = {
            showUserGroupEditModal: false,
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
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
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
                console.info('FAILURE:', response);
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
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
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
        const { userGroup, match } = this.props;
        const { showUserGroupEditModal } = this.state;

        const isCurrentUserAdmin = this.isCurrentUserAdmin(userGroup.memberships || []);

        return (
            <div styleName="usergroup">
                <div styleName="left">
                    <div styleName="title">
                        <h1>{ userGroup.title }</h1>
                        {
                            isCurrentUserAdmin &&
                            <TransparentPrimaryButton onClick={this.handleUserGroupEditClick}>
                                <span className="ion-edit" />
                            </TransparentPrimaryButton>
                        }
                    </div>
                    <Tabs
                        activeLinkStyle={{ none: 'none' }}
                        styleName="tabs-container"
                    >
                        <div styleName="tabs-header-container">
                            <TabLink
                                styleName="tab-header"
                                to="members"
                            >
                                Members
                            </TabLink>
                            <TabLink
                                styleName="tab-header"
                                to="Projects"
                            >
                                Projects
                            </TabLink>
                            {/* Essential for border bottom, for more info contact AdityaKhatri */}
                            <div styleName="empty-tab" />
                        </div>
                        <TabContent
                            for="members"
                            styleName="tab"
                        >
                            <MembersTable
                                memberData={userGroup.memberships || []}
                                userGroupId={+match.params.userGroupId}
                                isCurrentUserAdmin={isCurrentUserAdmin}
                                activeUser={this.props.activeUser}
                            />
                        </TabContent>
                        <TabContent
                            for="Projects"
                            styleName="tab"
                        >
                            <ProjectsTable
                                match={match}
                                isCurrentUserAdmin={isCurrentUserAdmin}
                                userGroup={userGroup}
                            />
                        </TabContent>
                    </Tabs>
                </div>
                <div styleName="right">
                    Activity Log
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleUserGroupEditModalClose}
                    show={showUserGroupEditModal}
                    styleName="user-group-edit-modal"
                >
                    <ModalHeader
                        title={`Edit User Group: ${userGroup.title}`}
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
