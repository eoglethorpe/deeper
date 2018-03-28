/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author jacky <prabes.pathak@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
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
    userGroupsSelector,
    setUserGroupsAction,
    activeUserSelector,
    unSetUserGroupAction,
    userIdFromRouteSelector,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';
import {
    iconNames,
    pathNames,
} from '../../../constants';

import UserGroupGetRequest from '../requests/UserGroupGetRequest';
import UserGroupDeleteRequest from '../requests/UserGroupDeleteRequest';

import UserGroupAdd from './UserGroupAdd';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    setUserGroups: PropTypes.func.isRequired,
    userGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetUserGroup: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    userGroups: [],
};


const mapStateToProps = (state, props) => ({
    userGroups: userGroupsSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroups: params => dispatch(setUserGroupsAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addUserGroup: false,

            // Delete Modal state
            deleteUserGroup: false,
            deletePending: false,

            // Active Delete state
            activeUserGroup: {},
            confirmText: '',
        };

        this.userGroupsTableHeaders = [
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
                modifier: (row) => {
                    const { userId } = this.props;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'joinedAt',
                label: this.props.userStrings('tableHeaderJoinedAt'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: (row) => {
                    const { userId } = this.props;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === userId);
                    const { joinedAt } = membership || {};
                    return (
                        <FormattedDate
                            date={joinedAt}
                            mode="dd-MM-yyyy hh:mm"
                        />
                    );
                },
            },
            {
                key: 'actions',
                label: this.props.userStrings('tableHeaderActions'),
                order: 4,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    const linkToUserGroup = reverseRoute(
                        pathNames.userGroup,
                        { userGroupId: d.id },
                    );

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <Link
                                title={this.props.userStrings('viewUsergroupLinkTitle')}
                                to={linkToUserGroup}
                                className={styles.link}
                            >
                                <span className={iconNames.openLink} />
                            </Link>
                        );
                    }

                    return ([
                        <Link
                            title={this.props.userStrings('editUsergroupLinkTitle')}
                            key="usergroup-panel"
                            to={linkToUserGroup}
                            className={styles.link}
                        >
                            <span className={iconNames.edit} />
                        </Link>,
                        <DangerButton
                            key="delete"
                            title={this.props.userStrings('deleteUsergroupLinkTitle')}
                            onClick={() => this.handleDeleteUserGroupClick(d)}
                            iconName={iconNames.delete}
                            smallVerticalPadding
                            transparent
                        />,
                    ]);
                },
            },
        ];
        this.userGroupsTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props;
        this.startRequestForUserGroups(userId);
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.startRequestForUserGroups(userId);
        }
    }

    componentWillUnmount() {
        if (this.userGroupsRequest) {
            this.userGroupsRequest.stop();
        }
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
    }

    startRequestForUserGroups = (userId) => {
        if (this.userGroupsRequest) {
            this.userGroupsRequest.stop();
        }
        const userGroupsRequest = new UserGroupGetRequest({
            setUserGroups: this.props.setUserGroups,
            // setState: v => this.setState(v),
        });
        this.userGroupsRequest = userGroupsRequest.create(userId);
        this.userGroupsRequest.start();
    }

    startRequestForUserGroupDelete = (userGroupId, userId) => {
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
        const userGroupDeleteRequest = new UserGroupDeleteRequest({
            unSetUserGroup: this.props.unSetUserGroup,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.userGroupDeleteRequest = userGroupDeleteRequest.create({
            userGroupId, userId,
        });
        this.userGroupDeleteRequest.start();
    }

    // BUTTONS

    handleAddUserGroupClick = () => {
        this.setState({ addUserGroup: true });
    }

    handleAddUserGroupClose = () => {
        this.setState({ addUserGroup: false });
    }

    // Table Actions

    // Delete Click
    handleDeleteUserGroupClick = (userGroup) => {
        const confirmText = `${this.props.userStrings('confirmTextDeleteUserGroup')} ${userGroup.title} ?`;
        this.setState({
            deleteUserGroup: true,
            activeUserGroup: userGroup,
            confirmText,
        });
    }

    // Delete Close
    handleDeleteUserGroupClose = (confirm) => {
        if (confirm) {
            const { id } = this.state.activeUserGroup;
            const userId = this.props.activeUser.userId;
            this.startRequestForUserGroupDelete(id, userId);
        }
        this.setState({ deleteUserGroup: false });
    }

    render() {
        const {
            className,
            userGroups,
            userId,
            activeUser,
        } = this.props;

        const {
            addUserGroup,
            deleteUserGroup,
            deletePending,
            confirmText,
        } = this.state;

        const isCurrentUser = userId === activeUser.userId;

        return (
            <div className={`${styles.groups} ${className}`}>
                {deletePending && <LoadingAnimation />}
                <div className={styles.header}>
                    <h2>
                        {this.props.userStrings('headerGroups')}
                    </h2>
                    {
                        isCurrentUser && (
                            <PrimaryButton
                                onClick={this.handleAddUserGroupClick}
                            >
                                {this.props.userStrings('addUserGroupButtonLabel')}
                            </PrimaryButton>
                        )
                    }
                </div>
                { addUserGroup &&
                    <Modal
                        closeOnEscape
                        onClose={this.handleAddUserGroupClose}
                    >
                        <ModalHeader
                            title={this.props.userStrings('addUserGroupButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddUserGroupClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody>
                            <UserGroupAdd
                                handleModalClose={this.handleAddUserGroupClose}
                            />
                        </ModalBody>
                    </Modal>
                }
                <Confirm
                    onClose={this.handleDeleteUserGroupClose}
                    show={deleteUserGroup}
                >
                    <p>{confirmText}</p>
                </Confirm>
                <div className={styles.usergroupTable}>
                    <Table
                        data={userGroups}
                        headers={this.userGroupsTableHeaders}
                        keyExtractor={this.userGroupsTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
