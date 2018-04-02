import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '../../../vendor/react-store/utils/common';
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
    unSetMembershipAction,
    setUsersMembershipAction,
    setUserMembershipAction,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';
import { iconNames } from '../../../constants';

import MembershipRoleChangeRequest from '../requests/MembershipRoleChangeRequest';
import MembershipDeleteRequest from '../requests/MembershipDeleteRequest';

import AddUserGroupMembers from './AddUserGroupMembers';
import ActionButtons from './ActionButtons';

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
                modifier: row => (
                    <ActionButtons
                        row={row}
                        activeUser={this.props.activeUser}
                        isCurrentUserAdmin={this.props.isCurrentUserAdmin}
                        onRemoveMember={this.handleDeleteMemberClick}
                        onChangeMemberRole={this.handleToggleMemberRoleClick}
                    />
                ),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            memberData: nextProps.memberData,
        });
    }

    componentWillUnmount() {
        if (this.membershipRoleChangeRequest) {
            this.membershipRoleChangeRequest.stop();
        }
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }
    }

    startRequestForMembershipRoleChange = (params) => {
        if (this.membershipRoleChangeRequest) {
            this.membershipRoleChangeRequest.stop();
        }
        const { userGroupId } = this.props;
        const membershipRoleChangeRequest = new MembershipRoleChangeRequest({
            setUserMembership: this.props.setUserMembership,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.membershipRoleChangeRequest = membershipRoleChangeRequest.create(
            params, userGroupId,
        );
        this.membershipRoleChangeRequest.start();
    }

    startRequestForMembershipDelete = (membershipId) => {
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }
        const userGroupId = this.props.userGroupId;
        const membershipDeleteRequest = new MembershipDeleteRequest({
            unSetMembership: this.props.unSetMembership,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.membershipDeleteRequest = membershipDeleteRequest.create(
            membershipId, userGroupId,
        );
        this.membershipDeleteRequest.start();
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
        const confirmText = this.props.userStrings('confirmTextRemoveMember', { memberName: row.memberName });

        this.setState({
            confirmText,
            selectedMember: row,
            deleteMemberConfirmShow: true,
        });
    };

    handleDeleteMemberClose = (confirm) => {
        const { selectedMember } = this.state;
        if (confirm) {
            this.startRequestForMembershipDelete(selectedMember.id);
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
        const confirmText = member.role === 'admin'
            ? this.props.userStrings('confirmTextRevokeAdmin', { memberName: member.memberName })
            : this.props.userStrings('confirmTextGrantAdmin', { memberName: member.memberName });

        this.setState({
            toggleRoleConfirmShow: true,
            confirmText,
            selectedMember: member,
        });
    }

    handleToggleMemberRole = (confirm) => {
        const { selectedMember } = this.state;
        if (confirm) {
            this.startRequestForMembershipRoleChange({
                membershipId: selectedMember.id,
                newRole: selectedMember.role === 'admin' ? 'normal' : 'admin',
            });
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
            <div className={`${this.props.className} ${styles.members}`}>
                { actionPending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {this.props.userStrings('tableHeaderMembers')}
                    </h2>
                    <div className={styles.pusher} />
                    <SearchInput
                        placeholder={this.props.userStrings('placeholderSearch')}
                        onChange={this.handleSearchMemberChange}
                        value={searchMemberInputValue}
                        className={styles.searchInput}
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
                <div className={styles.content}>
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
                        className={styles.addMemberModal}
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
                            className={styles.addMember}
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
