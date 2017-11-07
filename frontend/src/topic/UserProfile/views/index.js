/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    TextInput,
    requiredCondition,
} from '../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../public/components/Action';
import {
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../public/components/View';
import { RestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';
import { pageTitles } from '../../../common/utils/labels';
import {
    createUrlForUser,
    createParamsForUser,
    createUrlForUserPatch,
    createParamsForUserPatch,
    createUrlForUserGroupsOfUser,
    createParamsForUserGroups,
    createUrlForProjectsOfUser,
    createParamsForProjects,
} from '../../../common/rest';

import { tokenSelector } from '../../../common/selectors/auth';
import {
    userGroupsSelector,
    userInformationSelector,
    userProjectsSelector,
} from '../../../common/selectors/domainData';
import {
    setUserGroupsAction,
    setUserInformationAction,
    setUserProjectsAction,
} from '../../../common/action-creators/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';


import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setNavbarState: PropTypes.func.isRequired,
    setUserGroups: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    setUserProjects: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    user: PropTypes.object, // eslint-disable-line
    userGroups: PropTypes.array, // eslint-disable-line
    userInformation: PropTypes.object.isRequired, // eslint-disable-line
    userProjects: PropTypes.array, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    user: {},
    userGroups: [],
    userProjects: [],
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userGroups: userGroupsSelector(state, props),
    userInformation: userInformationSelector(state, props), // uses props.match
    userProjects: userProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setUserGroups: params => dispatch(setUserGroupsAction(params)),
    setUserInformation: params => dispatch(setUserInformationAction(params)),
    setUserProjects: params => dispatch(setUserProjectsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserProfile extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            editProfile: false,

            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        };

        this.elements = [
            'firstName',
            'lastName',
            'organization',
        ];
        this.validations = {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
        };

        this.projectHeaders = [
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
                key: 'createdAt',
                label: 'Created at',
                order: 3,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'modifiedAt',
                label: 'Last Modified at',
                order: 4,
                modifier: row => (
                    <FormattedDate
                        date={row.modifiedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'status',
                label: 'Status',
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'members',
                label: 'Members',
                order: 6,
                modifier: d => (d.memberships || []).length, // NOTE: Show 'Active' for now
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
            },
        ];
        this.userGroupsHeaders = [
            {
                key: 'title',
                label: 'Name',
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
        ];
    }

    componentWillMount() {
        // console.log('Mounting UserProfile');
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });

        const { userId } = this.props.match.params;

        this.userRequest = this.createRequestForUser(userId);
        this.userRequest.start();

        this.projectsRequest = this.createRequestForProjects(userId);
        this.projectsRequest.start();

        this.userGroupsRequest = this.createRequestForUserGroups(userId);
        this.userGroupsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.userRequest.stop();
            this.userRequest = this.createRequestForUser(userId);
            this.userRequest.start();

            this.projectsRequest.stop();
            this.projectsRequest = this.createRequestForProjects(userId);
            this.projectsRequest.start();

            this.userGroupsRequest.stop();
            this.userGroupsRequest = this.createRequestForUserGroups(userId);
            this.userGroupsRequest.start();
        }
    }

    componentWillUnmount() {
        // console.log('Unmounting UserProfile');
        this.userRequest.stop();
        this.projectsRequest.stop();
        this.userGroupsRequest.stop();
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
    }

    createRequestForUser = (userId) => {
        const urlForUser = createUrlForUser(userId);
        const userRequest = new RestBuilder()
            .url(urlForUser)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'userGetResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();
        return userRequest;
    }

    createRequestForProjects = (userId) => {
        const projectsRequest = new RestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjects({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUserProjects({
                        userId,
                        projects: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();
        return projectsRequest;
    }

    createRequestForUserGroups = (userId) => {
        const projectsRequest = new RestBuilder()
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
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();
        return projectsRequest;
    }
    createRequestForUserPatch = (userId, { firstName, lastName, organization }) => {
        const urlForUser = createUrlForUserPatch(userId);
        const userPatchRequest = new RestBuilder()
            .url(urlForUser)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUserPatch({ access }, { firstName, lastName, organization });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .success((response) => {
                this.setState({
                    pending: false,
                    editProfile: false,
                });
                try {
                    schema.validate(response, 'userPatchResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);

                this.setState({ pending: false });
                const { errors } = response;
                const formFieldErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formFieldErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({
                    formFieldErrors,
                    formErrors: nonFieldErrors,
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({ pending: false });
            })
            .build();
        return userPatchRequest;
    }

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
        });
    };

    successCallback = (values) => {
        this.setState({ pending: true });
        // Stop old patch request
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        // Create new patch request and start it
        const { match } = this.props;
        const userId = match.params.userId;
        this.userPatchRequest = this.createRequestForUserPatch(userId, values);
        this.userPatchRequest.start();
    };

    // BUTTONS

    handleFormCancel = (e) => {
        e.preventDefault();
        this.setState({ editProfile: false });
    };

    handleEditProfileClick = () => {
        this.setState({
            editProfile: true,
            formValues: this.props.userInformation,
            formFieldErrors: {},
            formErrors: [],
        });
    }

    handleEditProfileClose = () => {
        this.setState({ editProfile: false });
    }

    render() {
        // console.log('Rendering UserProfile');
        const { userInformation } = this.props;
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            stale,
        } = this.state;

        return (
            <div styleName="user-profile">
                <Helmet>
                    <title>
                        { pageTitles.userProfile }
                    </title>
                </Helmet>
                <header styleName="header">
                    <h1>
                        { pageTitles.userProfile }
                    </h1>
                    <PrimaryButton onClick={this.handleEditProfileClick} >
                        Edit profile
                    </PrimaryButton>
                    <Modal
                        closeOnEscape
                        onClose={this.handleEditProfileClose}
                        show={this.state.editProfile}
                    >
                        <ModalHeader title="Edit profile" />
                        <ModalBody>
                            <Form
                                styleName="user-profile-edit-form"
                                changeCallback={this.changeCallback}
                                elements={this.elements}
                                failureCallback={this.failureCallback}
                                successCallback={this.successCallback}
                                validation={this.validation}
                                validations={this.validations}
                            >
                                {
                                    pending &&
                                    <div styleName="pending-overlay">
                                        <i
                                            className="ion-load-c"
                                            styleName="loading-icon"
                                        />
                                    </div>
                                }
                                <div styleName="non-field-errors">
                                    {
                                        formErrors.map(err => (
                                            <div
                                                key={err}
                                                styleName="error"
                                            >
                                                {err}
                                            </div>
                                        ))
                                    }
                                    { formErrors.length <= 0 &&
                                        <div styleName="error empty">
                                            -
                                        </div>
                                    }
                                </div>
                                {/*
                                <ImageInput
                                    showPreview
                                    styleName="display-picture"
                                />
                                */}
                                <TextInput
                                    label="First name"
                                    formname="firstName"
                                    placeholder="Enter a descriptive name"
                                    value={formValues.firstName}
                                    error={formFieldErrors.firstName}
                                />
                                <TextInput
                                    label="Last name"
                                    formname="lastName"
                                    placeholder="Enter a descriptive name"
                                    value={formValues.lastName}
                                    error={formFieldErrors.lastName}
                                />
                                <TextInput
                                    label="Organization"
                                    formname="organization"
                                    placeholder="Enter a descriptive name"
                                    value={formValues.organization}
                                    error={formFieldErrors.organization}
                                />
                                <div styleName="action-buttons">
                                    <DangerButton
                                        onClick={this.handleFormCancel}
                                        disabled={pending}
                                    >
                                        Cancel
                                    </DangerButton>
                                    <PrimaryButton disabled={pending || !stale} >
                                        Save changes
                                    </PrimaryButton>
                                </div>
                            </Form>

                        </ModalBody>
                    </Modal>
                </header>
                <div styleName="info">
                    {/* FIXME: add a default image in img */}
                    <img
                        alt="User avatar"
                        src={userInformation.displayPicture || 'https://i.imgur.com/yJP07D6.png'}
                        styleName="display-picture"
                    />
                    <div styleName="detail">
                        <p styleName="name">
                            <span styleName="first">
                                { userInformation.firstName }
                            </span>
                            <span styleName="last">
                                { userInformation.lastName }
                            </span>
                        </p>
                        <p styleName="email">
                            { userInformation.email }
                        </p>
                        <p styleName="organization">
                            { userInformation.organization }
                        </p>
                    </div>
                </div>
                <div styleName="stats">
                    <h2>Stats</h2>
                </div>
                <div styleName="projects">
                    <h2>
                        Projects
                    </h2>
                    <Table
                        data={this.props.userProjects}
                        headers={this.projectHeaders}
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
                <div styleName="groups">
                    <h2>
                        Groups
                    </h2>
                    <Table
                        data={this.props.userGroups}
                        headers={this.userGroupsHeaders}
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
            </div>
        );
    }
}
