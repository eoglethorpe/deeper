import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormattedDate,
} from '../../../../public/components/View';
import {
    TextInput,
    SelectInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    TransparentButton,
    TransparentDangerButton,
} from '../../../../public/components/Action';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../../public/utils/common';

import {
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
    createParamsForUserMembershipCreate,
    urlForUserMembership,
    createParamsForUserMembershipRoleChange,
} from '../../../../common/rest';
import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import styles from './styles.scss';

const propTypes = {
    memberData: PropTypes.array.isRequired, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line
    userGroupId: PropTypes.number.isRequired,
    setUsersMembership: PropTypes.func.isRequired,
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
            showDeleteMemberModal: false,
            deletePending: false,
            activeMemberDelete: {},
            nonMemberUsers: this.getNonMemberUsers(props.users, props.memberData),
            newMemberUsers: [],
            saveChangeDisabled: true,
            searchMemberInputValue: '',
            addMemberSelectInputValue: [],
            newMembers: {},
            memberData: this.props.memberData,
            roleChangPending: false,
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
                            <div className="actions">
                                <Link
                                    title="View Member"
                                    className="forward-btn"
                                    key={row.member}
                                    to={reverseRoute(pathNames.userProfile, { userId: row.member })}
                                >
                                    <span className="ion-android-open" />
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div className="actions">
                            <TransparentButton
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                className="admin-btn"
                                onClick={() => this.handleToggleMemberRole(row)}
                            >
                                {
                                    isAdmin ? <i className="ion-locked" />
                                        : <i className="ion-android-person" />
                                }
                            </TransparentButton>
                            <TransparentButton
                                title="Delete Member"
                                className="delete-btn"
                                onClick={() => this.handleDeleteMemberClick(row)}
                            >
                                <i className="ion-android-delete" />
                            </TransparentButton>
                        </div>
                    );
                },
            },
        ];

        this.newMemberHeaders = [
            {
                key: 'displayName',
                label: 'Name',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.displayName.localeCompare(b.displayName),
            },
            {
                key: 'email',
                label: 'Email',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.email.localeCompare(b.email),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <div className="actions">
                            <TransparentButton
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                className="admin-btn"
                                onClick={() =>
                                    this.handleRoleChangeForNewMember({
                                        memberId: row.id,
                                        newRole: isAdmin ? 'normal' : 'admin',
                                    })
                                }
                            >
                                {
                                    isAdmin ? <i className="ion-locked" />
                                        : <i className="ion-android-person" />
                                }
                            </TransparentButton>
                            <TransparentDangerButton
                                title="Remove Member"
                                className="member-add-btn"
                                onClick={() => this.handleRemoveSelectedMember(row)}
                            >
                                <i className="ion-close" />
                            </TransparentDangerButton>
                        </div>
                    );
                },
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            nonMemberUsers: this.getNonMemberUsers(nextProps.users, nextProps.memberData),
            memberData: nextProps.memberData,
        });
    }

    getNonMemberUsers = (users, members) => (
        users.filter(user => (
            members.findIndex(member => (member.member === user.id)) === -1
        ))
    )

    createRequestForMembershipDelete = (membershipId) => {
        const userGroupId = this.props.userGroupId;
        const urlForMembership = createUrlForUserMembership(membershipId);

        const membershipDeleteRequest = new FgRestBuilder()
            .url(urlForMembership)
            .params(() => createParamsForUserMembershipDelete())
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .success(() => {
                try {
                    this.props.unSetMembership({
                        membershipId,
                        userGroupId,
                    });
                    this.setState({ showDeleteMemberModal: false });
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

    createRequestForMembershipCreate = (memberList) => {
        const userGroupId = this.props.userGroupId;

        const membershipDeleteRequest = new FgRestBuilder()
            .url(urlForUserMembership)
            .params(() => createParamsForUserMembershipCreate({ memberList }))
            .preLoad(() => {
                this.setState({ addPending: true });
            })
            .postLoad(() => {
                this.setState({ addPending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userMembershipCreateResponse');
                    this.props.setUsersMembership({
                        usersMembership: response.results,
                        userGroupId,
                    });
                    this.handleAddMemberModalClose();
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
            .preLoad(() => {
                // TODO: use this state
                this.setState({ roleChangPending: true });
            })
            .postLoad(() => {
                this.setState({ roleChangPending: false });
            })
            .success((response) => {
                try {
                    schema.validate({ results: [response] }, 'userMembershipCreateResponse');
                    this.props.setUserMembership({
                        userMembership: response,
                        userGroupId,
                    });
                    this.handleAddMemberModalClose();
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

    handleRemoveSelectedMember = (row) => {
        const newerMembers = { ...this.state.newMembers };
        delete newerMembers[row.id];

        this.setState({
            newMembers: newerMembers,
            addMemberSelectInputValue: Object.keys(newerMembers).map(id => +id),
        });
    };

    handleAddMemberClick = (row) => {
        this.setState({
            editRow: row,
            showAddMemberModal: true,
        });
    }

    handleAddMemberModalClose = () => {
        this.setState({
            // editRow: {},
            showAddMemberModal: false,
            addMemberSelectInputValue: [],
            newMembers: {},
            saveChangeDisabled: true,
        });
    }

    handleDeleteMemberClick = (row) => {
        this.setState({
            activeMemberDelete: row,
            showDeleteMemberModal: true,
        });
    };

    handleDeleteMemberClose = () => {
        this.setState({ showDeleteMemberModal: false });
    }

    handleRoleChangeForNewMember = ({ memberId, newRole }) => {
        const newMembers = { ...this.state.newMembers };

        newMembers[memberId].role = newRole;
        this.setState({
            newMembers,
        });
    }

    saveNewMemberChanges = () => {
        if (this.requestForMembershipCreate) {
            this.requestForMembershipCreate.stop();
        }

        const { newMembers } = this.state;
        const { userGroupId } = this.props;

        const newMemberList = Object.keys(newMembers).map(id => (
            {
                group: userGroupId,
                member: newMembers[id].id,
                role: newMembers[id].role,
            }
        ));

        this.requestForMembershipCreate = this.createRequestForMembershipCreate(newMemberList);
        this.requestForMembershipCreate.start();
    }

    deleteActiveMember = () => {
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }

        const { activeMemberDelete } = this.state;
        this.membershipDeleteRequest = this.createRequestForMembershipDelete(
            activeMemberDelete.id,
        );
        this.membershipDeleteRequest.start();
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

    handleToggleMemberRole = (member) => {
        if (this.membershipRoleChangeRequest) {
            this.membershipRoleChangeRequest.stop();
        }

        this.membershipRoleChangeRequest = this.createRequestForMembershipRoleChange({
            membershipId: member.id,
            newRole: member.role === 'admin' ? 'normal' : 'admin',
        });

        this.membershipRoleChangeRequest.start();
    }

    handleAddMemberSelectChange = (value) => {
        const newMembers = { ...this.state.newMembers };
        const removedNewMembersId = Object.keys(newMembers).filter(id => (
            value.indexOf(id) === -1),
        );

        removedNewMembersId.forEach((id) => {
            delete newMembers[id];
        });

        value.forEach((id) => {
            if (newMembers[id]) {
                return;
            }
            const currentMember = this.state.nonMemberUsers.find(user => user.id === id);
            newMembers[id] = { ...currentMember };
            newMembers[id].role = newMembers[id].role || 'normal';
        });

        this.setState({
            addMemberSelectInputValue: value,
            newMembers,
            saveChangeDisabled: false,
        });
    }

    render() {
        const {
            activeMemberDelete,
            deletePending,
            addPending,
            memberData,
            saveChangeDisabled,
            showDeleteMemberModal,
            searchMemberInputValue,
            showAddMemberModal,
            addMemberSelectInputValue,
            newMembers,
            nonMemberUsers,
        } = this.state;

        const newMemberList = Object.keys(newMembers).map(id => newMembers[id]);

        return (
            <div styleName="members">
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
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddMemberModalClose}
                    show={showAddMemberModal}
                >
                    <ModalHeader
                        title="Add New Member"
                    />
                    <ModalBody
                        styleName="add-member-modal"
                    >
                        <SelectInput
                            placeholder="Search Member"
                            styleName="modal-search-input"
                            showLabel={false}
                            showHintAndError={false}
                            options={nonMemberUsers}
                            keySelector={(user = {}) => user.id}
                            labelSelector={(user = {}) => user.displayName}
                            value={addMemberSelectInputValue}
                            onChange={this.handleAddMemberSelectChange}
                            multiple
                        />
                        <div styleName="new-member-table">
                            {
                                addPending &&
                                <div styleName="pending-overlay">
                                    <i
                                        className="ion-load-c"
                                        styleName="loading-icon"
                                    />
                                </div>
                            }
                            <Table
                                data={newMemberList}
                                headers={this.newMemberHeaders}
                                keyExtractor={rowData => rowData.id}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div styleName="action-buttons">
                            <DangerButton
                                onClick={this.handleAddMemberModalClose}
                            >
                                Cancel
                            </DangerButton>
                            <PrimaryButton
                                disabled={saveChangeDisabled}
                                onClick={this.saveNewMemberChanges}
                            >
                                Save changes
                            </PrimaryButton>
                        </div>
                    </ModalFooter>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteMemberClose}
                    show={showDeleteMemberModal}
                >
                    <ModalHeader title="Delete Member" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteMemberClose}
                            handleDelete={this.deleteActiveMember}
                            getName={() => (activeMemberDelete.memberName)}
                            getType={() => ('Member')}
                            pending={deletePending}
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
