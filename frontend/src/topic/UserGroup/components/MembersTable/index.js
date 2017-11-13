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
    usersInformationListSelector,
} from '../../../../common/redux';
import styles from './styles.scss';

const propTypes = {
    memberData: PropTypes.array.isRequired, // eslint-disable-line
    users: PropTypes.array.isRequired, // eslint-disable-line
};
const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
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
                            onClick={() => this.handleRemoveMemberClick(row)}
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

    handleRemoveMemberClick = (row) => {
        console.log(row);
    };

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
        });
    }
    render() {
        const { users, memberData } = this.props;

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
                    <div styleName="add-button">
                        <PrimaryButton
                            onClick={this.handleAddMemberClick}
                        >
                            Add New Member
                        </PrimaryButton>
                    </div>
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
                                data={users}
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
                            <PrimaryButton>
                                Save changes
                            </PrimaryButton>
                        </div>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
