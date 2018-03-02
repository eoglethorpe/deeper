import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '../../../../vendor/react-store/utils/common';
import update from '../../../../vendor/react-store/utils/immutable-update';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import FormattedDate from '../../../../vendor/react-store/components/View/FormattedDate';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';

import {
    transformResponseErrorToFormError,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../rest';
import {
    usersInformationListSelector,
    activeUserSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setUserProjectMembershipAction,
    unsetUserProjectMembershipAction,
    setProjectAction,

    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../redux';
import schema from '../../../../schema';
import notify from '../../../../notify';
import {
    pathNames,
    iconNames,
} from '../../../../constants';

import ProjectGeneralForm from './ProjectGeneralForm';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProject: PropTypes.func.isRequired,
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    unsetUserProjectMembership: params => dispatch(unsetUserProjectMembershipAction(params)),
    setUserProjectMembership: params => dispatch(setUserProjectMembershipAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
            users,
        } = props;

        const formValues = {
            ...projectDetails,
            memberships: (projectDetails.memberships || emptyList).map(m => ({
                ...m,
                memberId: m.id,
                name: m.memberName,
                email: m.memberEmail,
                id: m.member,
            })),
            regions: (projectDetails.regions || emptyList).map(region => region.id),
            userGroups: (projectDetails.userGroups || emptyList).map(userGroups => userGroups.id),
        };

        const memberOptions = this.getMemberOptions(users, projectDetails.memberships);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues,
            memberOptions,

            regionOptions: projectOptions.regions || emptyList,
            userGroupsOptions: projectOptions.userGroups || emptyList,
            selectedMember: {},

            pristine: false,
            pending: false,
            actionPending: false,

            showAddMemberModal: false,
            deleteMemberConfirmShow: false,
            toggleRoleConfirmShow: false,

            confirmText: '',
        };

        this.memberHeaders = [
            {
                key: 'name',
                label: this.props.projectStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'email',
                label: this.props.projectStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberEmail, b.memberEmail),
            },
            {
                key: 'role',
                label: this.props.projectStrings('tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: this.props.projectStrings('tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: row => (
                    <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: this.props.projectStrings('tableHeaderActions'),
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const isCurrentUser = row.member === this.props.activeUser.userId;
                    if (isCurrentUser) {
                        return (
                            <div>
                                <Link
                                    className={styles['view-member-link']}
                                    title={this.props.projectStrings('viewMemberLinkTitle')}
                                    key={row.member}
                                    to={reverseRoute(pathNames.userProfile, { userId: row.member })}
                                >
                                    <span className={iconNames.openLink} />
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div>
                            <PrimaryButton
                                smallVerticalPadding
                                type="button"
                                title={
                                    isAdmin
                                        ? this.props.projectStrings('revokeAdminRightsTitle')
                                        : this.props.projectStrings('grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                type="button"
                                title={this.props.projectStrings('deleteMemberLinkTitle')}
                                onClick={() => this.handleDeleteMemberClick(row)}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </div>
                    );
                },
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectDetails,
            projectOptions,
            users,
        } = nextProps;

        if (nextProps !== this.props) {
            const formValues = {
                ...projectDetails,
                regions: (projectDetails.regions || emptyList).map(region => region.id),
                memberships: (projectDetails.memberships || emptyList).map(m => ({
                    ...m,
                    name: m.memberName,
                    email: m.memberEmail,
                    memberId: m.id,
                    id: m.member,
                })),
                userGroups: (projectDetails.userGroups || emptyList).map(u => u.id),
            };
            const memberOptions = this.getMemberOptions(users, projectDetails.memberships);
            this.setState({
                memberOptions,
                formValues,
                regionOptions: projectOptions.regions || emptyList,
                userGroupsOptions: projectOptions.userGroups || emptyList,
            });
        }
    }

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }

        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }
    }

    getMemberOptions = (users, members) => {
        if (!members) return emptyList;
        if (!users) {
            return members.map(m => ({
                ...m,
                name: m.memberName,
                email: m.memberEmail,
                role: m.role,
                memberId: m.id,
                id: m.member,
            }));
        }
        const memberOptions = members.map(m => ({
            ...m,
            name: m.memberName,
            email: m.memberEmail,
            id: m.member,
            memberId: m.id,
        }));
        const finalOptions = [...memberOptions];

        users.forEach((u) => {
            const memberIndex = memberOptions.findIndex(m => m.member === u.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    name: u.displayName,
                    email: u.email,
                    role: 'normal',
                    id: u.id,
                });
            }
        });

        return finalOptions;
    }

    createProjectPatchRequest = (newProjectDetails, projectId) => {
        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch(newProjectDetails))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProject({
                        project: response,
                    });
                    notify.send({
                        title: this.props.notificationStrings('projectDetails'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('projectDetailsSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('projectDetails'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('projectDetailsFailure'),
                    duration: notify.duration.SLOW,
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
                    title: this.props.notificationStrings('projectDetails'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('projectDetailsFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to save project.'] },
                });
            })
            .build();
        return projectPatchRequest;
    };

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
            pristine: false,
        });
    };

    handleFormCancel = () => {
        const { projectDetails } = this.props;

        const formValues = {
            ...projectDetails,
            regions: (projectDetails.regions || emptyList).map(region => region.id),
            memberships: (projectDetails.memberships || emptyList).map(m => ({
                ...m,
                name: m.memberName,
                email: m.memberEmail,
                memberId: m.id,
                id: m.member,
            })),
            userGroups: (projectDetails.userGroups || emptyList).map(userGroups => userGroups.id),
        };

        this.setState({
            formValues,
            pristine: false,
            pending: false,
            formErrors: {},
            formFieldErrors: {},
        });
    };

    successCallback = (values) => {
        const { projectId } = this.props;

        const regions = values.regions.map(region => ({ id: region }));
        const userGroups = values.userGroups.map(userGroup => ({ id: userGroup }));

        const newProjectDetails = {
            ...values,
            regions,
            userGroups,
        };

        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        this.projectPatchRequest = this.createProjectPatchRequest(newProjectDetails, projectId);
        this.projectPatchRequest.start();

        this.setState({ pristine: false });
    };

    handleToggleMemberRoleClick = (member) => {
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
    };

    handleDeleteMemberClick = (member) => {
        const { formValues } = this.state;
        const index = (formValues.memberships || emptyList).findIndex(m => m.id === member.id);
        if (index !== -1) {
            const settings = {
                memberships: {
                    $splice: [[index, 1]],
                },
            };

            const newFormValues = update(formValues, settings);
            this.setState({
                formValues: newFormValues,
                pristine: true,
            });
        }
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,
            pristine,
            pending,
            actionPending,
            memberOptions,
            regionOptions,
            userGroupsOptions,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <div
                className={`${className} ${styles['project-general']}`}
            >
                {actionPending && <LoadingAnimation />}
                <ProjectGeneralForm
                    formValues={formValues}
                    regionOptions={regionOptions}
                    userGroupsOptions={userGroupsOptions}
                    memberOptions={memberOptions}
                    formErrors={formErrors}
                    formFieldErrors={formFieldErrors}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    handleFormCancel={this.handleFormCancel}
                    successCallback={this.successCallback}
                    memberHeaders={this.memberHeaders}
                    className={styles['project-general-form']}
                    pristine={pristine}
                    pending={pending}
                />
            </div>
        );
    }
}
