import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '../../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../../vendor/react-store/components/View/FormattedDate';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import Table from '../../../vendor/react-store/components/View/Table';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';

import {
    unSetMembershipAction,
    setUsersMembershipAction,
    setUserMembershipAction,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
    createParamsForUserMembershipRoleChange,
} from '../../../rest';
import {
    iconNames,
    pathNames,
} from '../../../constants';
import schema from '../../../schema';
import notify from '../../../notify';

import AddUserGroupMembers from './AddUserGroupMembers';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    memberData: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
    setUserMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
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
                label: this.props.userStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'memberEmail',
                label: this.props.userStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberEmail, b.memberEmail),
            },
            {
                key: 'role',
                label: this.props.userStrings('tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: this.props.userStrings('tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.jointedAt),
                modifier: row => <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'actions',
                label: this.props.userStrings('tableHeaderActions'),
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const isCurrentUser = row.member === this.props.activeUser.userId;
                    if (isCurrentUser || !this.props.isCurrentUserAdmin) {
                        return (
                            <div>
                                <Link
                                    title={this.props.userStrings('viewMemberLinkTitle')}
                                    key={row.member}
                                    to={reverseRoute(pathNames.userProfile, { userId: row.member })}
                                    className={styles.link}
                                >
                                    <span className={iconNames.openLink} />
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div>
                            <PrimaryButton
                                title={
                                    isAdmin
                                        ? this.props.userStrings('revokeAdminLinkTitle')
                                        : this.props.userStrings('grantAdminLinkTitle')
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                smallVerticalPadding
                                transparent
                            />
                            <DangerButton
                                title={this.props.userStrings('deleteMemberLinkTitle')}
                                onClick={() => this.handleDeleteMemberClick(row)}
                                iconName={iconNames.delete}
                                smallVerticalPadding
                                transparent
                            />
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
                // FIXME: write schema
                try {
                    this.props.unSetMembership({
                        membershipId,
                        userGroupId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userMembershipDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipDeleteFatal'),
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
                        title: this.props.notificationStrings('userMembershipRole'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipRoleSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipRole'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipRoleFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipRole'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipRoleFatal'),
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
        const accessRight = member.role === 'admin'
            ? this.props.userStrings('confirmTextRevokeAdmin')
            : this.props.userStrings('confirmTextGrantAdmin');

        const confirmText = `${accessRight} ${member.memberName}?`;
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
            <div
                className={this.props.className}
                styleName="members"
            >
                { actionPending && <LoadingAnimation /> }
                <div styleName="header">
                    <h2>
                        {this.props.userStrings('tableHeaderMembers')}
                    </h2>
                    <div styleName="pusher" />
                    <TextInput
                        placeholder={this.props.userStrings('placeholderSearch')}
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
                            {this.props.userStrings('addMemberButtonLabel')}
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
                { showAddMemberModal &&
                    <Modal
                        styleName="add-member-modal"
                        closeOnEscape
                        onClose={this.handleAddMemberModalClose}
                    >
                        <ModalHeader
                            title={this.props.userStrings('addMemberButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddMemberModalClose}
                                    transparent
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody
                            styleName="add-member"
                        >
                            <AddUserGroupMembers
                                userGroupId={this.props.userGroupId}
                                onModalClose={this.handleAddMemberModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}