import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { compareString } from '../../../../vendor/react-store/utils/common';
import Form, { requiredCondition } from '../../../../vendor/react-store/components/Input/Form';
import update from '../../../../vendor/react-store/utils/immutable-update';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import TabularSelectInput from '../../../../vendor/react-store/components/Input/TabularSelectInput';

import {
    usersInformationListSelector,
    setUsersInformationAction,

    groupSelector,
    setUsersMembershipAction,

    notificationStringsSelector,
    userStringsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import UsersGetRequest from '../../requests/UsersGetRequest';
import MembershipPostRequest from '../../requests/MembershipPostRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    userGroupDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsers: PropTypes.func.isRequired,
    setUsersMembership: PropTypes.func.isRequired,

    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    userGroupId: undefined,
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    userGroupDetails: groupSelector(state, props),

    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class AddUserGroupMembers extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.displayName;
    static optionKeySelector = (d = {}) => d.id;

    constructor(props) {
        super(props);

        const {
            userGroupDetails,
            users,
        } = props;

        const usersWithRole = users.map(
            user => ({ ...user, role: 'normal' }),
        );
        const membersBlackList = (userGroupDetails.memberships || emptyList).map(d => d.member);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: {},

            pending: false,
            pristine: false,
            usersWithRole,
            membersBlackList,
        };

        this.memberHeaders = [
            {
                key: 'displayName',
                label: this.props.userStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.displayName, b.displayName),
            },
            {
                key: 'email',
                label: this.props.userStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.email, b.email),
            },
            {
                key: 'actions',
                label: this.props.userStrings('tableHeaderActions'),
                order: 3,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const title = isAdmin ? (
                        this.props.userStrings('revokeAdminLinkTitle')
                    ) : (
                        this.props.userStrings('grantAdminLinkTitle')
                    );
                    return (
                        <div className="actions">
                            <PrimaryButton
                                title={title}
                                onClick={() => this.handleRoleChangeForNewMember(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                smallVerticalPadding
                                transparent
                            />
                        </div>
                    );
                },
            },
        ];

        this.schema = {
            fields: {
                memberships: [requiredCondition],
            },
        };
    }

    componentWillMount() {
        this.startRequestForUsers();
    }

    componentWillReceiveProps(nextProps) {
        const { users } = nextProps;

        if (this.props.users !== users) {
            const usersWithRole = users.map(
                user => ({ ...user, role: 'normal' }),
            );
            this.setState({ usersWithRole });
        }
    }

    componentWillUnmount() {
        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
    }

    startRequestForUsers = () => {
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
        const usersRequest = new UsersGetRequest({
            setUsers: this.props.setUsers,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.usersRequest = usersRequest.create();
        this.usersRequest.start();
    }

    startRequestForMembershipCreate = (memberList) => {
        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }
        const { userGroupId } = this.props;
        const membershipCreateRequest = new MembershipPostRequest({
            setUsersMembership: this.props.setUsersMembership,
            onModalClose: this.props.onModalClose,
            notificationStrings: this.props.notificationStrings,
            userStrings: this.props.userStrings,
            setState: v => this.setState(v),
        });
        this.membershipCreateRequest = membershipCreateRequest.create(memberList, userGroupId);
        this.membershipCreateRequest.start();
    }

    handleRoleChangeForNewMember = (member) => {
        const { formValues } = this.state;
        const index = (formValues.memberships || emptyList).findIndex(m => m.id === member.id);
        if (index !== -1) {
            const settings = {
                memberships: {
                    [index]: {
                        role: {
                            $set: member.role === 'admin' ? 'normal' : 'admin',
                        },
                    },
                },
            };

            const newFormValues = update(formValues, settings);
            this.setState({
                formValues: newFormValues,
                pristine: true,
            });
        }
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        const { userGroupId } = this.props;

        const newMembersList = values.memberships.map(member => ({
            member: member.id,
            role: member.role,
            group: userGroupId,
        }));

        this.startRequestForMembershipCreate(newMembersList);
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            pristine,
            usersWithRole,
            membersBlackList,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={`${className} ${styles.addMemberForm}`}
                schema={this.schema}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    className={styles.nonFieldErrors}
                    formerror=""
                />
                <TabularSelectInput
                    formname="memberships"
                    className={styles.tabularSelect}
                    blackList={membersBlackList}
                    options={usersWithRole}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddUserGroupMembers.optionLabelSelector}
                    keySelector={AddUserGroupMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                    error={formFieldErrors.memberships}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {this.props.userStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {this.props.userStrings('modalSave')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
