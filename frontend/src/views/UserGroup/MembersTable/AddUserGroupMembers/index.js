import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { compareString } from '../../../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';
import Form, { requiredCondition } from '../../../../vendor/react-store/components/Input/Form';
import update from '../../../../vendor/react-store/utils/immutable-update';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import TabularSelectInput from '../../../../vendor/react-store/components/Input/TabularSelectInput';

import {
    transformResponseErrorToFormError,
    urlForUserMembership,
    createParamsForUserMembershipCreate,
    createParamsForUser,
    createUrlForUsers,
} from '../../../../rest';
import {
    usersInformationListSelector,
    setUsersInformationAction,

    groupSelector,
    setUsersMembershipAction,

    notificationStringsSelector,
    userStringsSelector,
} from '../../../../redux';
import schema from '../../../../schema';
import notify from '../../../../notify';
import { iconNames } from '../../../../constants';

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

        const usersWithRole = users.map(user => ({ ...user, role: 'normal' }));
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
                                type="button"
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
        if (this.usersRequest) {
            this.usersRequest.stop();
        }

        this.usersRequest = this.createRequestForUsers();
        this.usersRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { users } = this.props;

        if (nextProps.users !== users) {
            const usersWithRole = users.map(user => ({ ...user, role: 'normal' }));
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

    createRequestForUsers = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
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
                    formErrors: { errors: ['Error while trying to add members.'] },
                });
            })
            .build();
        return membershipCreateRequest;
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

        let newMembersList = [...values.memberships];

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
                className={className}
                styleName="add-member-form"
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
                    styleName="non-field-errors"
                    formerror=""
                />
                <TabularSelectInput
                    formname="memberships"
                    styleName="tabular-select"
                    blackList={membersBlackList}
                    options={usersWithRole}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddUserGroupMembers.optionLabelSelector}
                    keySelector={AddUserGroupMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                    error={formFieldErrors.memberships}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
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
