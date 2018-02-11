/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author jacky <prabes.pathak@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';
import DangerButton from '../../../../public/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import Confirm from '../../../../public/components/View/Modal/Confirm';
import FormattedDate from '../../../../public/components/View/FormattedDate';
import Modal from '../../../../public/components/View/Modal';
import ModalBody from '../../../../public/components/View/Modal/Body';
import ModalHeader from '../../../../public/components/View/Modal/Header';
import Table from '../../../../public/components/View/Table';

import {
    createParamsForUserGroups,
    createParamsForUserGroupsDelete,
    createUrlForUserGroup,
    createUrlForUserGroupsOfUser,
} from '../../../../common/rest';
import {
    userGroupsSelector,
    setUserGroupsAction,
    activeUserSelector,
    unSetUserGroupAction,
    userIdFromRouteSelector,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../../common/redux';
import {
    iconNames,
    pathNames,
} from '../../../../common/constants';
import schema from '../../../../common/schema';
import notify from '../../../../common/notify';

import { UserGroupAdd } from '../../components/';
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
@CSSModules(styles, { allowMultiple: true })
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
        this.userGroupsRequest = this.createRequestForUserGroups(userId);
        this.userGroupsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.userGroupsRequest.stop();
            this.userGroupsRequest = this.createRequestForUserGroups(userId);
            this.userGroupsRequest.start();
        }
    }

    componentWillUnmount() {
        this.userGroupsRequest.stop();
    }

    createRequestForUserGroupDelete = (userGroupId) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userId = this.props.activeUser.userId;

        const userGroupDeletRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsDelete())
            .success(() => {
                // FIXME: write schema
                try {
                    this.props.unSetUserGroup({
                        userGroupId,
                        userId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userGroupDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userGroupDeleteSuccess'),
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
                    title: this.props.notificationStrings('userGroupDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userGroupDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupDeleteFatal'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userGroupDeletRequest;
    }

    createRequestForUserGroups = (userId) => {
        const userGroupsRequest = new FgRestBuilder()
            .url(createUrlForUserGroupsOfUser(userId))
            .params(() => createParamsForUserGroups())
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupsGetResponse');
                    this.props.setUserGroups({
                        userId,
                        userGroups: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return userGroupsRequest;
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
        const confirmText = `Are you sure you want to delete the usergroup
            ${userGroup.title}?`;

        this.setState({
            deleteUserGroup: true,
            activeUserGroup: userGroup,
            confirmText,
        });
    }

    // Delete Close
    handleDeleteUserGroupClose = (confirm) => {
        if (confirm) {
            if (this.userGroupDeleteRequest) {
                this.userGroupDeleteRequest.stop();
            }
            this.userGroupDeleteRequest = this.createRequestForUserGroupDelete(
                this.state.activeUserGroup.id,
            );
            this.userGroupDeleteRequest.start();
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
            <div
                styleName="groups"
                className={className}
            >
                {deletePending && <LoadingAnimation />}
                <div styleName="header">
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
                <div styleName="usergroup-table">
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
