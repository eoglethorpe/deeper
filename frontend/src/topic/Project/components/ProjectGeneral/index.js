import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    compareString,
    compareDate,
} from '../../../../public/utils/common';
import { FgRestBuilder } from '../../../../public/utils/rest';
import Table from '../../../../public/components/View/Table';
import FormattedDate from '../../../../public/components/View/FormattedDate';
import Modal from '../../../../public/components/View/Modal';
import ModalBody from '../../../../public/components/View/Modal/Body';
import ModalHeader from '../../../../public/components/View/Modal/Header';
import Confirm from '../../../../public/components/View/Modal/Confirm';
import LoadingAnimation from '../../../../public/components/View/LoadingAnimation';
import Button from '../../../../public/components/Action/Button';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import DangerButton from '../../../../public/components/Action/Button/DangerButton';

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

    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../common/redux';
import schema from '../../../../common/schema';
import {
    pathNames,
    iconNames,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import ProjectGeneralForm from '../ProjectGeneralForm';
import AddProjectMembers from '../AddProjectMembers';
import styles from './styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProject: PropTypes.func.isRequired,
    unsetUserProjectMembership: PropTypes.func.isRequired,
    setUserProjectMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    activeUser: activeUserSelector(state),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
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
                label: this.props.projectStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'memberEmail',
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
                // FIXME: write schema
                try {
                    this.props.unsetUserProjectMembership({
                        memberId,
                        projectId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userMembershipDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipDeleteFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipDeleteFatal'),
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
                        title: this.props.notificationStrings('userMembershipRole'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userMembershipRoleSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipRole'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipRoleFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userMembershipRole'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userMembershipRoleFatal'),
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
        const accessRight = member.role === 'admin'
            ? this.props.projectStrings('confirmTextRevokeAdmin')
            : this.props.projectStrings('confirmTextGrantAdmin');

        const confirmText = `${this.props.projectStrings('confirmText')} ${accessRight} ${member.memberName}?`;
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
        const confirmText = `${this.props.projectStrings('confirmTextRemove')} ${member.memberName} from this project?`;
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
                        <h2>
                            {this.props.projectStrings('headerMembers')}
                        </h2>
                        <div styleName="action-buttons">
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddMemberClick}
                            >
                                {this.props.projectStrings('addMemberButtonLabel')}
                            </PrimaryButton>
                        </div>
                    </header>
                    { showAddMemberModal &&
                        <Modal
                            styleName="add-member-modal"
                            onClose={this.handleModalClose}
                            closeOnEscape
                        >
                            <ModalHeader
                                title={this.props.projectStrings('addMemberButtonLabel')}
                                rightComponent={
                                    <Button
                                        onClick={this.handleModalClose}
                                        transparent
                                    >
                                        <span className={iconNames.close} />
                                    </Button>
                                }
                            />
                            <ModalBody styleName="modal-body">
                                <AddProjectMembers
                                    styleName="add-member"
                                    projectId={projectId}
                                    onModalClose={this.handleModalClose}
                                />
                            </ModalBody>
                        </Modal>
                    }
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
