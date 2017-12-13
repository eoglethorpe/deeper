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
    pathNames,
} from '../../../../common/constants';

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
                label: 'Name',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.memberName.localeCompare(b.memberName),
            },
            {
                key: 'memberEmail',
                label: 'Email',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.memberEmail.localeCompare(b.memberEmail),
            },
            {
                key: 'role',
                label: 'Rights',
                order: 3,
                sortable: true,
                comparator: (a, b) => a.role.localeCompare(b.role),
            },
            {
                key: 'joinedAt',
                label: 'Joined At',
                order: 4,
                sortable: true,
                comparator: (a, b) => a.joinedAt - b.joinedAt,
                modifier: row => <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const isCurrentUser = row.member === this.props.activeUser.userId;
                    if (isCurrentUser || !this.props.isCurrentUserAdmin) {
                        return (
                            <div>
                                <Link
                                    title="View Member"
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
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                            >
                                {
                                    isAdmin ? <i className={iconNames.locked} />
                                        : <i className={iconNames.person} />
                                }
                            </TransparentPrimaryButton>
                            <TransparentDangerButton
                                title="Delete Member"
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
            'revoke admin rights form' :
            'grant admin rights to';

        const confirmText = `Are you sure you want to ${accessRight} ${member.memberName}?`;
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
                    <TextInput
                        placeholder="Search Member"
                        onChange={this.handleSearchMemberChange}
                        value={searchMemberInputValue}
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <div styleName="pusher" />
                    {
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddMemberClick}
                        >
                            Add New Member
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
                        title="Add New Member"
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
