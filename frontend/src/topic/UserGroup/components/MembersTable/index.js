import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../public/components/View';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    TransparentButton,
    TransparentAccentButton,
} from '../../../../public/components/Action';
import {
    tokenSelector,
    usersInformationListSelector,
    unSetMembershipAction,
    setUsersMembershipAction,
} from '../../../../common/redux';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
    createParamsForUserMembershipCreate,
} from '../../../../common/rest';

import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import styles from './styles.scss';

const propTypes = {
    memberData: PropTypes.array.isRequired, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line
    userGroupId: PropTypes.number.isRequired,
    setUsersMembership: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetMembership: params => dispatch(unSetMembershipAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
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
                key: 'email',
                label: 'Email',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.email.localeCompare(b.memberName),
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
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            className="admin-btn"
                        >
                            <i className="ion-ios-locked" />
                        </TransparentButton>
                        <TransparentButton
                            className="delete-btn"
                            onClick={() => this.handleDeleteMemberClick(row)}
                        >
                            <i className="ion-android-delete" />
                        </TransparentButton>
                    </div>
                ),
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
                modifier: row => (
                    <div className="actions">
                        <TransparentAccentButton
                            className="member-add-btn"
                            onClick={() => this.handleAddNewMemberClick(row)}
                        >
                            <i className="ion-plus" />
                        </TransparentAccentButton>
                        <TransparentButton
                            className="admin-btn"
                        >
                            <i className="ion-ios-locked" />
                        </TransparentButton>
                    </div>
                ),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            nonMemberUsers: this.getNonMemberUsers(nextProps.users, nextProps.memberData),
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

        const membershipDeleteRequest = new RestBuilder()
            .url(urlForMembership)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserMembershipDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
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
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
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
        const urlForMembership = createUrlForUserMembership(memberList);

        const membershipDeleteRequest = new RestBuilder()
            .url(urlForMembership)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserMembershipCreate(
                    { access },
                    { memberList, userGroupId },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    // TODO: write schema
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUsersMembership({
                        usersMembership: response,
                        userGroupId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .preLoad(() => {
                this.setState({ addPending: true });
            })
            .postLoad(() => {
                this.setState({ addPending: false });
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

    handleAddNewMemberClick = (row) => {
        console.log(row);
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
            newMemberUsers: [],
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

    addNewMember = (newMember) => {
        const { newMemberUsers } = this.state;
        const newMemberArrayIndex = newMemberUsers.findIndex(
            newMemberUser => (newMemberUser.id === newMember.id));

        if (newMemberArrayIndex !== -1) {
            this.setState({
                newMemberUsers: [...this.state.newMemberUsers, newMember],
            });
        }
    }

    saveNewMemberChanges = () => {
        if (this.requestForMembershipCreate) {
            this.requestForMembershipCreate.stop();
        }

        const { newMemberUsers } = this.state;
        const newMemberList = newMemberUsers.map(newMemberUser => (newMemberUser.id));

        console.log(newMemberList);
        // TODO: complete rest request
        // this.requestForMembershipCreate = this.createRequestForMembershipCreate(newMemberList);
        // this.requestForMembershipCreate.start();
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

    render() {
        const { memberData } = this.props;

        const {
            activeMemberDelete,
            deletePending,
            showDeleteMemberModal,
            newMemberUsers,
        } = this.state;

        return (
            <div styleName="members">
                <div styleName="header">
                    <TextInput
                        placeholder="Search Member"
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <div styleName="pusher" />
                    <PrimaryButton
                        onClick={this.handleAddMemberClick}
                    >
                        Add New Member
                    </PrimaryButton>
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
                    show={this.state.showAddMemberModal}
                >
                    <ModalHeader
                        title="Add New Member"
                    />
                    <ModalBody
                        styleName="add-member-modal"
                    >
                        <TextInput
                            placeholder="Search Member"
                            type="search"
                            styleName="modal-search-input"
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <div styleName="new-member-table">
                            <Table
                                data={newMemberUsers}
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
