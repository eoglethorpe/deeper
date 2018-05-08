import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
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
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import SelectInputWithList from '../../../../vendor/react-store/components/Input/SelectInputWithList';
import TabularSelectInput from '../../../../vendor/react-store/components/Input/TabularSelectInput';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import Faram, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForProjectPatch,
    createUrlForProject,
    createParamsForGet,
    createUrlForUsers,
} from '../../../../rest';
import {
    usersInformationListSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setUserProjectMembershipAction,
    unsetUserProjectMembershipAction,
    setUsersInformationAction,
    setProjectAction,
} from '../../../../redux';
import schema from '../../../../schema';
import notify from '../../../../notify';
import _ts from '../../../../ts';
import {
    pathNames,
    iconNames,
} from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProject: PropTypes.func.isRequired,
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsers: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    unsetUserProjectMembership: params => dispatch(unsetUserProjectMembershipAction(params)),
    setUsers: params => dispatch(setUsersInformationAction(params)),
    setUserProjectMembership: params => dispatch(setUserProjectMembershipAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    static memberOptionLabelSelector = (d = {}) => d.name;
    static memberOptionKeySelector = (d = {}) => d.id;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
            users,
        } = props;

        const faramValues = {
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
            faramErrors: {},
            faramValues,
            memberOptions,

            regionOptions: projectOptions.regions || emptyList,
            userGroupsOptions: projectOptions.userGroups || emptyList,

            pristine: false,
            pending: true,
            actionPending: false,
        };

        this.memberHeaders = [
            {
                key: 'name',
                label: _ts('project', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'email',
                label: _ts('project', 'tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberEmail, b.memberEmail),
            },
            {
                key: 'role',
                label: _ts('project', 'tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: _ts('project', 'tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.joinedAt),
                modifier: row => (
                    <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: _ts('project', 'tableHeaderActions'),
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={
                                    isAdmin
                                        ? _ts('project', 'revokeAdminRightsTitle')
                                        : _ts('project', 'grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={_ts('project', 'deleteMemberLinkTitle')}
                                onClick={() => this.handleDeleteMemberClick(row)}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [],
                endDate: [],
                description: [],
                regions: [],
                userGroups: [],
                memberships: [],
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
        const {
            projectDetails,
            projectOptions,
            users,
        } = nextProps;

        if (nextProps !== this.props) {
            const faramValues = {
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
                faramValues,
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

        if (this.usersRequest) {
            this.usersRequest.stop();
        }
    }

    getMemberOptions = (users, members) => {
        if (!members) {
            return emptyList;
        }

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

    createRequestForUsers = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
            .params(createParamsForGet)
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
                        title: _ts('notification', 'projectDetails'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'projectDetailsSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: _ts('notification', 'projectDetails'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'projectDetailsFailure'),
                    duration: notify.duration.SLOW,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'projectDetails'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'projectDetailsFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    faramErrors: { $internal: [_ts('project', 'projectSaveFailure')] },
                });
            })
            .build();
        return projectPatchRequest;
    };

    // Faram RELATED
    handleFaramChange = (values, faramErrors) => {
        this.setState({
            faramValues: values,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramCancel = () => {
        const { projectDetails } = this.props;

        const faramValues = {
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
            faramValues,
            pristine: false,
            pending: false,
            faramErrors: {},
        });
    };

    handleValidationSuccess = (values) => {
        const { projectId } = this.props;

        const regions = values.regions.map(region => ({ id: region }));
        const userGroups = values.userGroups.map(userGroup => ({ id: userGroup }));
        const memberships = values.memberships.map(m => ({
            id: m.memberId,
            member: m.id,
            project: projectId,
            role: m.role,
        }));

        const newProjectDetails = {
            ...values,
            regions,
            userGroups,
            memberships,
        };

        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        this.projectPatchRequest = this.createProjectPatchRequest(newProjectDetails, projectId);
        this.projectPatchRequest.start();

        this.setState({ pristine: false });
    };

    handleToggleMemberRoleClick = (member) => {
        const { faramValues } = this.state;
        const index = (faramValues.memberships || emptyList).findIndex(m => m.id === member.id);
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

            const newFaramValues = update(faramValues, settings);
            this.setState({
                faramValues: newFaramValues,
                pristine: true,
            });
        }
    };

    handleGotoUserClick = (userId) => {
        const params = { userId };

        const win = window.open(reverseRoute(pathNames.userProfile, params), '_blank');
        win.focus();
    }

    handleDeleteMemberClick = (member) => {
        const { faramValues } = this.state;
        const index = (faramValues.memberships || emptyList).findIndex(m => m.id === member.id);
        if (index !== -1) {
            const settings = {
                memberships: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);
            this.setState({
                faramValues: newFaramValues,
                pristine: true,
            });
        }
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pristine,
            pending,
            actionPending,
            memberOptions,
            regionOptions,
            userGroupsOptions,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.projectGeneral}`}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                {actionPending && <LoadingAnimation large />}
                { pending && <LoadingAnimation /> }
                <div className={styles.actionButtons}>
                    <DangerButton
                        onClick={this.handleFaramCancel}
                        disabled={pending || !pristine}
                    >
                        {_ts('project', 'modalRevert')}
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalSave')}
                    </SuccessButton>
                </div>
                <NonFieldErrors faramElement />
                <div className={styles.inputsContainer}>
                    <TextInput
                        label={_ts('project', 'projectNameLabel')}
                        faramElementName="title"
                        placeholder={_ts('project', 'projectNamePlaceholder')}
                        className={styles.name}
                    />
                    <DateInput
                        label={_ts('project', 'projectStartDateLabel')}
                        faramElementName="startDate"
                        placeholder={_ts('project', 'projectStartDatePlaceholder')}
                        className={styles.startDate}
                    />
                    <DateInput
                        label={_ts('project', 'projectEndDateLabel')}
                        faramElementName="endDate"
                        placeholder={_ts('project', 'projectEndDatePlaceholder')}
                        className={styles.endDate}
                    />
                </div>
                <TextArea
                    label={_ts('project', 'projectDescriptionLabel')}
                    faramElementName="description"
                    placeholder={_ts('project', 'projectDescriptionPlaceholder')}
                    className={styles.description}
                    rows={3}
                />
                <div className={styles.selectsContainer}>
                    <SelectInputWithList
                        label={_ts('project', 'projectRegionLabel')}
                        faramElementName="regions"
                        placeholder={_ts('project', 'projectRegionPlaceholder')}
                        className={styles.regions}
                        options={regionOptions}
                        labelSelector={ProjectGeneral.optionLabelSelector}
                        keySelector={ProjectGeneral.optionKeySelector}
                        hideSelectAllButton
                    />
                    <SelectInputWithList
                        label={_ts('project', 'projectUserGroupLabel')}
                        faramElementName="userGroups"
                        placeholder={_ts('project', 'projectUserGroupPlaceholder')}
                        className={styles.userGroups}
                        options={userGroupsOptions}
                        labelSelector={ProjectGeneral.optionLabelSelector}
                        keySelector={ProjectGeneral.optionKeySelector}
                        hideSelectAllButton
                    />
                    <TabularSelectInput
                        faramElementName="memberships"
                        className={styles.members}
                        options={memberOptions}
                        label={_ts('project', 'projectMembersLabel')}
                        labelSelector={ProjectGeneral.memberOptionLabelSelector}
                        keySelector={ProjectGeneral.memberOptionKeySelector}
                        tableHeaders={this.memberHeaders}
                        hideRemoveFromListButton
                        hideSelectAllButton
                    />
                </div>
            </Faram>
        );
    }
}
