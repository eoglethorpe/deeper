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
} from '../../../../common/constants';
import {
    transformResponseErrorToFormError,
    createUrlForUserProjectMembership,
    createParamsForUserProjectMembershipDelete,
    createParamsForUserProjectMembershipPatch,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../common/rest';
import {
    activeProjectSelector,
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
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    setProject: PropTypes.func.isRequired,
    unsetUserProjectMembership: PropTypes.func.isRequired,
    setUserProjectMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
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
            stale: false,
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
                    if (isCurrentUser) {
                        return (
                            <div>
                                <Link
                                    title="View Member"
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
                                title={isAdmin ? 'Revoke admin rights' : 'Grant admin rights'}
                                onClick={() => this.handleToggleMemberRoleClick(row)}
                            >
                                {
                                    isAdmin ? <span className={iconNames.locked} />
                                        : <span className={iconNames.person} />
                                }
                            </TransparentPrimaryButton>
                            <TransparentDangerButton
                                title="Delete Member"
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
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
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
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: false,
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
            stale: false,
            pending: false,
            formErrors: [],
            formFieldErrors: {},
        });
    };

    successCallback = (values) => {
        const { activeProject } = this.props;

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

        this.projectPatchRequest = this.createProjectPatchRequest(newProjectDetails, activeProject);
        this.projectPatchRequest.start();

        this.setState({ stale: false });
    };

    createRequestForMembershipDelete = (memberId) => {
        const { activeProject } = this.props;
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
                        projectId: activeProject,
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
        return membershipDeleteRequest;
    }

    createRequestForMembershipPatch = ({ memberId, newRole }) => {
        const { activeProject } = this.props;
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
                        projectId: activeProject,
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
            'revoke admin rights form' :
            'grant admin rights to';

        const confirmText = `Are you sure you want to ${accessRight} ${member.memberName}?`;
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
        const confirmText = `Are you sure you remove ${member.memberName} from this project?`;
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
            stale,
            pending,
            actionPending,
            formValues,
            regionOptions,
            userGroupsOptions,
        } = this.state;

        const {
            projectDetails,
            activeProject,
        } = this.props;

        return (
            <div styleName="project-general">
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
                    stale={stale}
                    pending={pending}
                />
                <div styleName="members">
                    <header styleName="header">
                        <h2>Members</h2>
                        <div styleName="action-btns">
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddMemberClick}
                            >
                                Add
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
                            title="Add Members"
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
                                projectId={activeProject}
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
