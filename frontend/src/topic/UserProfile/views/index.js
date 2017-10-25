/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FormattedDate from '../../../public/components/FormattedDate';
import Table from '../../../public/components/Table';
import UserProfileEditForm from '../components/UserProfileEditForm';
import styles from './styles.scss';
import Modal, { Header, Body } from '../../../public/components/Modal';
import { RestBuilder } from '../../../public/utils/rest';
import { PrimaryButton } from '../../../public/components/Button';
import { pageTitles } from '../../../common/utils/labels';
import {
    tokenSelector,
} from '../../../common/selectors/auth';
import {
    userInformationSelector,
    userProjectsSelector,
} from '../../../common/selectors/domainData';
import {
    setUserInformationAction,
    setUserProjectsAction,
} from '../../../common/action-creators/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    createUrlForUser,
    createParamsForUser,

    createUrlForUserPatch,
    createParamsForUserPatch,

    createUrlForProjectsOfUser,
    createParamsForProjects,
} from '../../../common/rest';

import schema from '../../../common/schema';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setNavbarState: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    setUserProjects: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    user: PropTypes.object, // eslint-disable-line
    userInformation: PropTypes.object.isRequired, // eslint-disable-line
    userProjects: PropTypes.array, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    user: { },
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userInformation: userInformationSelector(state, props), // uses props.match
    userProjects: userProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
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
            pending: false,
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
                    const membership = row.memberships.find(d => d.member === +userId);
                    return (membership || { role: '-' }).role;
                },
            },
            {
                key: 'createdAt',
                label: 'Created at',
                order: 3,
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'modifiedAt',
                label: 'Last Modified at',
                order: 4,
                modifier: row => <FormattedDate date={row.modifiedAt} mode="dd-MM-yyyy hh:mm" />,
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
    }

    componentWillMount() {
        console.log('Mounting UserProfile');
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
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.userRequest.stop();
            this.projectsRequest.stop();

            this.userRequest = this.createRequestForUser(userId);
            this.userRequest.start();
            this.projectsRequest = this.createRequestForProjects(userId);
            this.projectsRequest.start();
        }
    }

    componentWillUnmount() {
        console.log('Unmounting UserProfile');

        this.userRequest.stop();
        this.projectsRequest.stop();
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
                const formErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({
                    formErrors,
                    nonFieldErrors,
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

    handleUserProfileEditSubmit = (data) => {
        this.setState({ pending: true });
        // Stop old patch request
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        // Create new patch request and start it
        const { match } = this.props;
        const userId = match.params.userId;
        this.userPatchRequest = this.createRequestForUserPatch(userId, data);
        this.userPatchRequest.start();
    }

    handleEditProfileClick = () => {
        this.setState({ editProfile: true });
    }

    handleEditProfileClose = () => {
        this.setState({ editProfile: false });
    }

    handleEditProfileCancel = () => {
        this.setState({ editProfile: false });
    }

    render() {
        console.log('Rendering UserProfile');
        const { userInformation } = this.props;

        return (
            <div styleName="user-profile">
                <Helmet>
                    <title>{ pageTitles.userProfile }</title>
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
                        <Header title="Edit profile" />
                        <Body>
                            <UserProfileEditForm
                                onSubmit={this.handleUserProfileEditSubmit}
                                formErrors={this.state.formErrors}
                                formError={this.state.nonFieldErrors}
                                formValues={userInformation}
                                pending={this.state.pending}
                                onCancel={this.handleEditProfileCancel}
                            />
                        </Body>
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
                </div>
            </div>
        );
    }
}
