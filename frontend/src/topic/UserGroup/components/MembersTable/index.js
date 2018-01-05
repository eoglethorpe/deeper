import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Table,
    Confirm,
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
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../../public/utils/common';

import {
    iconNames,
    notificationStrings,
    pathNames,
    userStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import {
    usersInformationListSelector,
    unSetMembershipAction,
    setUsersMembershipAction,
    setUserMembershipAction,
} from '../../../../common/redux';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
    createParamsForUserMembershipRoleChange,
} from '../../../../common/rest';
import schema from '../../../../common/schema';
import AddUserGroupMembers from '../AddUserGroupMembers';

import styles from './styles.scss';

const propTypes = {
    memberData: PropTypes.array.isRequired, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line
    userGroupId: PropTypes.number.isRequired,
    setUserMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    unSetMembership: params => dispatch(unSetMembershipAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
    setUserMembership: params => dispatch(setUserMembershipAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class MembersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddMemberModal: false,
            toggleRoleConfirmShow: false,
            deleteMemberConfirmShow: false,
            confirmText: '',
            searchMemberInputValue: '',
            memberData: this.props.memberData,
            actionPending: false,
            selectedMember: {},
        };
        this.memberHeaders = [
            {
                key: 'memberName',
                label: userStrings.tableHeaderName,
                order: 1,
                sortable: true,
                comparator: (a, b) => a.memberName.localeCompare(b.memberName),
            },
            {
                key: 'memberEmail',
                label: userStrings.tableHeaderEmail,
                order: 2,
                sortable: true,
                comparator: (a, b) => a.memberEmail.localeCompare(b.memberEmail),
            },
            {
                key: 'role',
                label: userStrings.tableHeaderRights,
                order: 3,
                sortable: true,
                comparator: (a, b) => a.role.localeCompare(b.role),
            },
            {
                key: 'joinedAt',
                label: userStrings.tableHeaderJoinedAt,
                order: 4,
                sortable: true,
                comparator: (a, b) => a.joinedAt - b.joinedAt,
                modifier: row => <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'actions',
                label: userStrings.tableHeaderActions,
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const isCurrentUser = row.member === this.props.activeUser.userId;
                    if (isCurrentUser || !this.props.isCurrentUserAdmin) {
                        return (
                            <div>
                                <Link
                                    title={userStrings.viewMemberLinkTitle}
                                    key={row.member}
                                    to={reverseRoute(pathNames.userProfile, { userId: row.member })}
                                >
                                    <TransparentPrimaryButton>
                                        <span className={iconNames.openLink} />
                                    </TransparentPrimaryButton>
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div>
                            <TransparentPrimaryButton
                                title={
                                    isAdmin ?
                                        userStrings.revokeAdminLinkTitle :
                                        userStrings.grantAdminLinkTitle
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                            >
                                {
                                    isAdmin ? <i className={iconNames.locked} />
                                        : <i className={iconNames.person} />
                                }
                            </TransparentPrimaryButton>
                            <TransparentDangerButton
                                title={userStrings.deleteMemberLinkTitle}
                                onClick={() => this.handleDeleteMemberClick(row)}
                            >
                                <i className={iconNames.delete} />
                            </TransparentDangerButton>
                        </div>
                    );
                },
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            memberData: nextProps.memberData,
        });
    }

    createRequestForMembershipDelete = (membershipId) => {
        const userGroupId = this.props.userGroupId;
        const urlForMembership = createUrlForUserMembership(membershipId);

        const membershipDeleteRequest = new FgRestBuilder()
            .url(urlForMembership)
            .params(() => createParamsForUserMembershipDelete())
            .preLoad(() => { this.setState({ actionPending: true }); })
            .postLoad(() => { this.setState({ actionPending: false }); })
            .success(() => {
                try {
                    this.props.unSetMembership({
                        membershipId,
                        userGroupId,
                    });
                    notify.send({
                        title: notificationStrings.userMembershipDelete,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userMembershipDeleteSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.userMembershipDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipDeleteFailure,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.userMembershipDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipDeleteFatal,
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return membershipDeleteRequest;
    }

    createRequestForMembershipRoleChange = ({ membershipId, newRole }) => {
        const urlForUserMembershipPatch = createUrlForUserMembership(membershipId);
        const userGroupId = this.props.userGroupId;

        const membershipRoleChangeRequest = new FgRestBuilder()
            .url(urlForUserMembershipPatch)
            .params(() => createParamsForUserMembershipRoleChange({ newRole }))
            .preLoad(() => { this.setState({ actionPending: true }); })
            .postLoad(() => { this.setState({ actionPending: false }); })
            .success((response) => {
                try {
                    schema.validate({ results: [response] }, 'userMembershipCreateResponse');
                    this.props.setUserMembership({
                        userMembership: response,
                        userGroupId,
                    });
                    notify.send({
                        title: notificationStrings.userMembershipRole,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userMembershipRoleSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.userMembershipRole,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipRoleFailure,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.userMembershipRole,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipRoleFatal,
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return membershipRoleChangeRequest;
    }

    handleAddMemberClick = (row) => {
        this.setState({
            editRow: row,
            showAddMemberModal: true,
        });
    }

    handleAddMemberModalClose = () => {
        this.setState({ showAddMemberModal: false });
    }

    handleDeleteMemberClick = (row) => {
        const confirmText = `Are you sure you want to remove
            ${row.memberName}?`;

        this.setState({
            confirmText,
            selectedMember: row,
            deleteMemberConfirmShow: true,
        });
    };

    handleDeleteMemberClose = (confirm) => {
        const { selectedMember } = this.state;
        if (confirm) {
            if (this.membershipDeleteRequest) {
                this.membershipDeleteRequest.stop();
            }

            this.membershipDeleteRequest = this.createRequestForMembershipDelete(
                selectedMember.id,
            );
            this.membershipDeleteRequest.start();
        }
        this.setState({ deleteMemberConfirmShow: false });
    }

    handleSearchMemberChange = (value) => {
        const { memberData } = this.props;
        const filteredMemberData = memberData.filter(
            member => caseInsensitiveSubmatch(member.memberName, value),
        );
        this.setState({
            searchMemberInputValue: value,
            memberData: filteredMemberData,
        });
    }

    handleToggleMemberRoleClick = (member) => {
        const accessRight = member.role === 'admin' ?
            userStrings.confirmTextRevokeAdmin :
            userStrings.confirmTextGrantAdmin;

        const confirmText = `${userStrings.confirmTextGrantAdmin} ${accessRight} ${member.memberName}?`;
        this.setState({
            toggleRoleConfirmShow: true,
            confirmText,
            selectedMember: member,
        });
    }

    handleToggleMemberRole = (confirm) => {
        const { selectedMember } = this.state;
        if (confirm) {
            if (this.membershipRoleChangeRequest) {
                this.membershipRoleChangeRequest.stop();
            }

            this.membershipRoleChangeRequest = this.createRequestForMembershipRoleChange({
                membershipId: selectedMember.id,
                newRole: selectedMember.role === 'admin' ? 'normal' : 'admin',
            });

            this.membershipRoleChangeRequest.start();
        }
        this.setState({ toggleRoleConfirmShow: false });
    }

    calcMemberKey = member => member.id;

    render() {
        const {
            memberData,
            deleteMemberConfirmShow,
            toggleRoleConfirmShow,
            searchMemberInputValue,
            showAddMemberModal,
            confirmText,
            actionPending,
        } = this.state;

        return (
            <div styleName="members">
                { actionPending && <LoadingAnimation /> }
                <div styleName="header">
                    <h2>
                        {userStrings.tableHeaderMembers}
                    </h2>
                    <div styleName="pusher" />
                    <TextInput
                        placeholder={userStrings.placeholderSearch}
                        onChange={this.handleSearchMemberChange}
                        value={searchMemberInputValue}
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    {
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddMemberClick}
                        >
                            {userStrings.addMemberButtonLabel}
                        </PrimaryButton>
                    }
                </div>
                <div styleName="content">
                    <Table
                        data={memberData}
                        headers={this.memberHeaders}
                        keyExtractor={this.calcMemberKey}
                    />
                    <Confirm
                        show={deleteMemberConfirmShow}
                        onClose={this.handleDeleteMemberClose}
                    >
                        <p>{confirmText}</p>
                    </Confirm>
                    <Confirm
                        show={toggleRoleConfirmShow}
                        onClose={this.handleToggleMemberRole}
                    >
                        <p>{confirmText}</p>
                    </Confirm>
                </div>
                <Modal
                    styleName="add-member-modal"
                    closeOnEscape
                    onClose={this.handleAddMemberModalClose}
                    show={showAddMemberModal}
                >
                    <ModalHeader
                        title={userStrings.addMemberButtonLabel}
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddMemberModalClose}
                            >
                                <span className={iconNames.close} />
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <AddUserGroupMembers
                            styleName="add-member"
                            userGroupId={this.props.userGroupId}
                            onModalClose={this.handleAddMemberModalClose}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
