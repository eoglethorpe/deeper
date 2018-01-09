import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Table,
    FormattedDate,
    Modal,
    ModalHeader,
    ModalBody,
    Confirm,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    PrimaryButton,
    TransparentButton,
    TransparentPrimaryButton,
    TransparentDangerButton,
} from '../../../../public/components/Action';
import {
    reverseRoute,
} from '../../../../public/utils/common';
import {
    pathNames,
    iconNames,
    notificationStrings,
    projectStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import {
    transformResponseErrorToFormError,
    createUrlForUserProjectMembership,
    createParamsForUserProjectMembershipDelete,
    createParamsForUserProjectMembershipPatch,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../common/rest';
import {
    activeUserSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setUserProjectMembershipAction,
    unsetUserProjectMembershipAction,
    setProjectAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';
import ProjectGeneralForm from '../ProjectGeneralForm';
import AddProjectMembers from '../AddProjectMembers';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    setProject: PropTypes.func.isRequired,
    unsetUserProjectMembership: PropTypes.func.isRequired,
    setUserProjectMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    unsetUserProjectMembership: params => dispatch(unsetUserProjectMembershipAction(params)),
    setUserProjectMembership: params => dispatch(setUserProjectMembershipAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
        } = props;

        const formValues = {
            ...projectDetails,
            regions: (projectDetails.regions || emptyList).map(region => region.id),
            userGroups: (projectDetails.userGroups || emptyList).map(userGroups => userGroups.id),
        };

        this.state = {
            showAddMemberModal: false,
            formErrors: [],
            formFieldErrors: {},
            pristine: false,
            pending: false,
            actionPending: false,
            formValues,
            regionOptions: projectOptions.regions || emptyList,
            userGroupsOptions: projectOptions.userGroups || emptyList,

            deleteMemberConfirmShow: false,
            toggleRoleConfirmShow: false,

            confirmText: '',
            selectedMember: {},
        };


        this.memberHeaders = [
            {
                key: 'memberName',
                label: projectStrings.tableHeaderName,
                order: 1,
                sortable: true,
                comparator: (a, b) => a.memberName.localeCompare(b.memberName),
            },
            {
                key: 'memberEmail',
                label: projectStrings.tableHeaderEmail,
                order: 2,
                sortable: true,
                comparator: (a, b) => a.memberEmail.localeCompare(b.memberEmail),
            },
            {
                key: 'role',
                label: projectStrings.tableHeaderRights,
                order: 3,
                sortable: true,
                comparator: (a, b) => a.role.localeCompare(b.role),
            },
            {
                key: 'joinedAt',
                label: projectStrings.tableHeaderJoinedAt,
                order: 4,
                sortable: true,
                comparator: (a, b) => a.joinedAt - b.joinedAt,
                modifier: row => <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'actions',
                label: projectStrings.tableHeaderActions,
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const isCurrentUser = row.member === this.props.activeUser.userId;
                    if (isCurrentUser) {
                        return (
                            <div>
                                <Link
                                    title={projectStrings.viewMemberLinkTitle}
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
                                title={isAdmin ? projectStrings.revokeAdminRightsTitle :
                                    projectStrings.grantAdminRightsTitle}
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                            >
                                {
                                    isAdmin ? <span className={iconNames.locked} />
                                        : <span className={iconNames.person} />
                                }
                            </TransparentPrimaryButton>
                            <TransparentDangerButton
                                title={projectStrings.deleteMemberLinkTitle}
                                onClick={() => this.handleDeleteMemberClick(row)}
                            >
                                <span className={iconNames.delete} />
                            </TransparentDangerButton>
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
        } = nextProps;

        if (nextProps !== this.props) {
            const formValues = {
                ...projectDetails,
                regions: (projectDetails.regions || []).map(region => region.id),
                userGroups: (projectDetails.userGroups || []).map(userGroups => userGroups.id),
            };
            this.setState({
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
                        title: notificationStrings.projectDetails,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.projectDetailsSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.projectDetails,
                    type: notify.type.ERROR,
                    message: notificationStrings.projectDetailsFailure,
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
                    title: notificationStrings.projectDetails,
                    type: notify.type.ERROR,
                    message: notificationStrings.projectDetailsFatal,
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save jroject.'],
                });
            })
            .build();
        return projectPatchRequest;
    };

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
            pristine: false,
        });
    };

    handleFormCancel = () => {
        const {
            projectDetails,
        } = this.props;

        const formValues = {
            ...projectDetails,
            regions: (projectDetails.regions || emptyList).map(region => region.id),
            userGroups: (projectDetails.userGroups || emptyList).map(userGroups => userGroups.id),
        };

        this.setState({
            formValues,
            pristine: false,
            pending: false,
            formErrors: [],
            formFieldErrors: {},
        });
    };

    successCallback = (values) => {
        const { projectId } = this.props;

        const regions = values.regions.map(region => ({
            id: region,
        }));
        const userGroups = values.userGroups.map(userGroup => ({
            id: userGroup,
        }));
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

    createRequestForMembershipDelete = (memberId) => {
        const { projectId } = this.props;
        const urlForMembership = createUrlForUserProjectMembership(memberId);

        const membershipDeleteRequest = new FgRestBuilder()
            .url(urlForMembership)
            .params(() => createParamsForUserProjectMembershipDelete())
            .preLoad(() => {
                this.setState({ actionPending: true });
            })
            .postLoad(() => {
                this.setState({ actionPending: false });
            })
            .success(() => {
                try {
                    this.props.unsetUserProjectMembership({
                        memberId,
                        projectId,
                    });
                    notify.send({
                        title: notificationStrings.userMembershipDelete,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userMembershipDeleteSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.userMembershipDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipDeleteFailure,
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.userMembershipDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipDeleteFatal,
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return membershipDeleteRequest;
    }

    createRequestForMembershipPatch = ({ memberId, newRole }) => {
        const { projectId } = this.props;
        const urlForUserMembershipPatch = createUrlForUserProjectMembership(memberId);

        const membershipPatchRequest = new FgRestBuilder()
            .url(urlForUserMembershipPatch)
            .params(() => createParamsForUserProjectMembershipPatch({ role: newRole }))
            .preLoad(() => {
                this.setState({ actionPending: true });
            })
            .postLoad(() => {
                this.setState({ actionPending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectMembership');
                    this.props.setUserProjectMembership({
                        memberDetails: response,
                        projectId,
                    });
                    notify.send({
                        title: notificationStrings.userMembershipRole,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userMembershipRoleSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.userMembershipRole,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipRoleFailure,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.userMembershipRole,
                    type: notify.type.ERROR,
                    message: notificationStrings.userMembershipRoleFatal,
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return membershipPatchRequest;
    }

    handleToggleMemberRole = (confirm) => {
        const { selectedMember } = this.state;
        const memberId = selectedMember.id;
        const isAdmin = selectedMember.role === 'admin';
        const newRole = isAdmin ? 'normal' : 'admin';

        if (confirm) {
            if (this.membershipPatchRequest) {
                this.membershipPatchRequest.stop();
            }

            this.membershipPatchRequest = this.createRequestForMembershipPatch({
                memberId,
                newRole,
            });
            this.membershipPatchRequest.start();
        }
        this.setState({ toggleRoleConfirmShow: false });
    }

    handleToggleMemberRoleClick = (member) => {
        const accessRight = member.role === 'admin' ?
            projectStrings.confirmTextRevokeAdmin :
            projectStrings.confirmTextGrantAdmin;

        const confirmText = `${projectStrings.confirmText} ${accessRight} ${member.memberName}?`;
        this.setState({
            toggleRoleConfirmShow: true,
            confirmText,
            selectedMember: member,
        });
    };

    handleDeleteMember = (confirm) => {
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

    handleDeleteMemberClick = (member) => {
        const confirmText = `${projectStrings.confirmTextRemove} ${member.memberName} from this project?`;
        this.setState({
            deleteMemberConfirmShow: true,
            confirmText,
            selectedMember: member,
        });
    };

    handleAddMemberClick = () => {
        this.setState({ showAddMemberModal: true });
    }

    handleModalClose = () => {
        this.setState({ showAddMemberModal: false });
    }

    memberKeyExtractor = member => member.id;

    render() {
        const {
            showAddMemberModal,
            toggleRoleConfirmShow,
            deleteMemberConfirmShow,
            confirmText,

            formErrors,
            formFieldErrors,
            pristine,
            pending,
            actionPending,
            formValues,
            regionOptions,
            userGroupsOptions,
        } = this.state;

        const {
            className,
            projectDetails,
            projectId,
        } = this.props;

        return (
            <div
                className={className}
                styleName="project-general"
            >
                {actionPending && <LoadingAnimation />}
                <ProjectGeneralForm
                    formValues={formValues}
                    regionOptions={regionOptions}
                    userGroupsOptions={userGroupsOptions}
                    formErrors={formErrors}
                    formFieldErrors={formFieldErrors}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    handleFormCancel={this.handleFormCancel}
                    successCallback={this.successCallback}
                    styleName="project-general-form"
                    pristine={pristine}
                    pending={pending}
                />
                <div styleName="members">
                    <header styleName="header">
                        <h2>{projectStrings.headerMembers}</h2>
                        <div styleName="action-buttons">
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddMemberClick}
                            >
                                {projectStrings.addMemberButtonLabel}
                            </PrimaryButton>
                        </div>
                    </header>
                    <Modal
                        styleName="add-member-modal"
                        onClose={this.handleModalClose}
                        show={showAddMemberModal}
                        closeOnEscape
                    >
                        <ModalHeader
                            title={projectStrings.addMemberButtonLabel}
                            rightComponent={
                                <TransparentButton
                                    onClick={this.handleModalClose}
                                >
                                    <span className={iconNames.close} />
                                </TransparentButton>
                            }
                        />
                        <ModalBody>
                            <AddProjectMembers
                                styleName="add-member"
                                projectId={projectId}
                                onModalClose={this.handleModalClose}
                            />
                        </ModalBody>
                    </Modal>
                    <div styleName="table-container">
                        <Table
                            data={projectDetails.memberships || emptyList}
                            headers={this.memberHeaders}
                            keyExtractor={member => member.id}
                        />
                        <Confirm
                            show={toggleRoleConfirmShow}
                            onClose={this.handleToggleMemberRole}
                        >
                            <p>{confirmText}</p>
                        </Confirm>
                        <Confirm
                            show={deleteMemberConfirmShow}
                            onClose={this.handleDeleteMember}
                        >
                            <p>{confirmText}</p>
                        </Confirm>
                    </div>
                </div>
            </div>
        );
    }
}
