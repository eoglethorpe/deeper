/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';

import {
    UserGroupAdd,
} from '../../components/';

import { RestBuilder } from '../../../../public/utils/rest';

import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';
import {
    createParamsForUserGroups,
    createParamsForUserGroupsDelete,
    createUrlForUserGroup,
    createUrlForUserGroupsOfUser,
} from '../../../../common/rest';
import {
    tokenSelector,
    userGroupsSelector,
    setUserGroupsAction,
    activeUserSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setUserGroups: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userGroups: PropTypes.array, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    userGroups: [],
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userGroups: userGroupsSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroups: params => dispatch(setUserGroupsAction(params)),
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

            // Active Delete state
            activeUserGroupDelete: null,
        };

        this.userGroupsTableHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 2,
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'joinedAt',
                label: 'Joined At',
                order: 3,
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
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
                label: 'Actions',
                order: 4,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <Link
                                key={d.title}
                                to={`/usergroup/${d.id}/`}
                            >
                                <i className="ion-eye" />
                            </Link>
                        );
                    }

                    const onDeleteClick = () => this.handleDeleteUserGroupClick(d.id);
                    return (
                        <div>
                            <Link
                                key={d.title}
                                to={`/usergroup/${d.id}/`}
                            >
                                <i className="ion-edit" />
                            </Link>
                            <DangerButton onClick={onDeleteClick} >
                                <i className="ion-android-delete" />
                            </DangerButton>
                        </div>
                    );
                },
            },
        ];
        this.userGroupsTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props.match.params;
        this.userGroupsRequest = this.createRequestForUserGroups(userId);
        this.userGroupsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.userGroupsRequest.stop();
            this.userGroupsRequest = this.createRequestForUserGroups(userId);
            this.userGroupsRequest.start();
        }
    }

    componentWillUnmount() {
        this.userGroupsRequest.stop();
    }

    getActiveDeleteUserGroupType = () => 'User Group'

    getActiveDeleteUserGroupName = () => {
        const { userGroups } = this.props;
        const userGroup = userGroups.find(e => (
            e.id === this.state.activeUserGroupDelete
        ));
        return userGroup ? userGroup.title : null;
    }

    deleteActiveUserGroup = () => {
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
        this.userGroupDeleteRequest = this.createRequestForUserGroupDelete(
            this.state.activeUserGroupDelete,
        );
        this.userGroupDeleteRequest.start();
    }

    createRequestForUserGroupDelete = (userGroupId) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userGroupDeletRequest = new RestBuilder()
            .url(urlForUserGroup)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserGroupsDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    console.log(response);
                    /*
                     * TODO: implement
                    this.props.unSetUserGroup({
                        userGroupId,
                    });
                    */
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
        return userGroupDeletRequest;
    }

    createRequestForUserGroups = (userId) => {
        const userGroupsRequest = new RestBuilder()
            .url(createUrlForUserGroupsOfUser(userId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserGroups({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
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
    handleDeleteUserGroupClick = (id) => {
        this.setState({
            deleteUserGroup: true,
            activeUserGroupDelete: id,
        });
    }

    // Delete Close
    handleDeleteUserGroupClose = () => {
        this.setState({ deleteUserGroup: false });
    }

    render() {
        const { userGroups } = this.props;
        const {
            addUserGroup,
            deleteUserGroup,
        } = this.state;
        return (
            <div styleName="groups">
                <h2>
                    Groups
                </h2>
                <PrimaryButton onClick={this.handleAddUserGroupClick} >
                    Add User Group
                </PrimaryButton>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddUserGroupClose}
                    show={addUserGroup}
                >
                    <ModalHeader title="Add User Group" />
                    <ModalBody>
                        <UserGroupAdd
                            handleModalClose={this.handleAddUserGroupClose}
                        />
                    </ModalBody>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteUserGroupClose}
                    show={deleteUserGroup}
                >
                    <ModalHeader title="Delete User Group" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteUserGroupClose}
                            handleDelete={this.deleteActiveUserGroup}
                            getName={this.getActiveDeleteUserGroupName}
                            getType={this.getActiveDeleteUserGroupType}
                        />
                    </ModalBody>
                </Modal>
                <Table
                    data={userGroups}
                    headers={this.userGroupsTableHeaders}
                    keyExtractor={this.userGroupsTableKeyExtractor}
                />
            </div>
        );
    }
}
