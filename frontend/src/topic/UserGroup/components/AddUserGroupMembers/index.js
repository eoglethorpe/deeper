import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import Form, { requiredCondition } from '../../../../public/components/Input/Form';
import NonFieldErrors from '../../../../public/components/Input/NonFieldErrors';
import DangerButton from '../../../../public/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import TabularSelectInput from '../../../../public/components/Input/TabularSelectInput';

import {
    transformResponseErrorToFormError,
    urlForUserMembership,
    createParamsForUserMembershipCreate,
    createParamsForUser,
    createUrlForUsers,
} from '../../../../common/rest';
import {
    usersInformationListSelector,
    setUsersInformationAction,

    groupSelector,
    setUsersMembershipAction,

    notificationStringsSelector,
    userStringsSelector,
} from '../../../../common/redux';
import schema from '../../../../common/schema';
import notify from '../../../../common/notify';
import { iconNames } from '../../../../common/constants';

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
@CSSModules(styles, { allowMultiple: true })
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

        const formValues = {
            ...userGroupDetails,
            memberships: [],
            membersBlackList: (userGroupDetails.memberships || emptyList).map(d => d.member),
        };

        const usersWithRole = users.map(user => ({
            ...user,
            role: 'normal',
        }));

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues,
            pending: false,
            pristine: false,
            usersWithRole,
        };

        this.memberHeaders = [
            {
                key: 'displayName',
                label: this.props.userStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => a.displayName.localeCompare(b.displayName),
            },
            {
                key: 'email',
                label: this.props.userStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => a.email.localeCompare(b.email),
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
                    const handleClick = () => this.handleRoleChangeForNewMember({
                        memberId: row.id,
                        newRole: isAdmin ? 'normal' : 'admin',
                    });
                    return (
                        <div className="actions">
                            <PrimaryButton
                                title={title}
                                type="button"
                                onClick={handleClick}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                smallVerticalPadding
                                transparent
                            />
                        </div>
                    );
                },
            },
        ];

        this.elements = [
            'memberships',
        ];
        this.validations = {
            memberships: [requiredCondition],
        };

        this.usersFields = ['display_name', 'email', 'id'];
    }

    componentWillMount() {
        if (this.usersRequest) {
            this.usersRequest.stop();
        }

        this.usersRequest = this.createRequestForUsers();
        this.usersRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { users } = this.props;

        if (nextProps.users !== users) {
            const usersWithRole = users.map(user => ({
                ...user,
                role: 'normal',
            }));
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

    handleRoleChangeForNewMember = ({ memberId, newRole }) => {
        const newUserList = [...this.state.usersWithRole];
        const index = newUserList.findIndex(user => user.id === memberId);

        if (index !== -1) {
            newUserList[index].role = newRole;
            this.setState({ usersWithRole: newUserList });
        }
    }

    createRequestForUsers = () => {
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers([this.usersFields]))
            .params(() => createParamsForUser())
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'usersGetResponse');
                    this.props.setUsers({
                        users: response.results,
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
        return usersRequest;
    }

    createRequestForMembershipCreate = (memberList) => {
        const { userGroupId } = this.props;

        const membershipCreateRequest = new FgRestBuilder()
            .url(urlForUserMembership)
            .params(() => createParamsForUserMembershipCreate({ memberList }))
            .preLoad(() => { this.setState({ addPending: true }); })
            .postLoad(() => { this.setState({ addPending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'userMembershipCreateResponse');
                    this.props.setUsersMembership({
                        usersMembership: response.results,
                        userGroupId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userMembershipCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to add members.'],
                });
            })
            .build();
        return membershipCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        const { usersWithRole } = this.state;
        const { userGroupId } = this.props;
        let newMembersList = usersWithRole.filter(user => (
            values.memberships.findIndex(d => (d === user.id)) !== -1
        ));

        newMembersList = newMembersList.map(member => ({
            member: member.id,
            role: member.role,
            group: userGroupId,
        }));

        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }

        this.membershipCreateRequest = this.createRequestForMembershipCreate(newMembersList);
        this.membershipCreateRequest.start();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            pristine,
            usersWithRole,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={className}
                styleName="add-member-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    styleName="non-field-errors"
                    errors={formErrors}
                />
                <TabularSelectInput
                    formname="memberships"
                    styleName="tabular-select"
                    blackList={formValues.membersBlackList}
                    options={usersWithRole}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddUserGroupMembers.optionLabelSelector}
                    onChange={this.handleTabularSelectInputChange}
                    keySelector={AddUserGroupMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                    error={formFieldErrors.memberships}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        {this.props.userStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine}>
                        {this.props.userStrings('modalSave')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
