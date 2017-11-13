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
    PrimaryButton,
} from '../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
} from '../../../public/components/View';

import {
    UserProject,
    UserGroup,
    UserEdit,
} from '../components/';

import { RestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';
import { pageTitles } from '../../../common/utils/labels';
import {
    createParamsForUser,
    createUrlForUser,
} from '../../../common/rest';
import {
    tokenSelector,
    userInformationSelector,
    setUserInformationAction,
    setNavbarStateAction,
    activeUserSelector,
} from '../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
            userGroupId: PropTypes.string,
        }),
    }),
    setNavbarState: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    user: PropTypes.object, // eslint-disable-line
    userInformation: PropTypes.object.isRequired, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    user: {},
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userInformation: userInformationSelector(state, props), // uses props.match
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserProfile extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { editProfile: false };
    }

    componentWillMount() {
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
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.userRequest.stop();
            this.userRequest = this.createRequestForUser(userId);
            this.userRequest.start();
        }
    }

    componentWillUnmount() {
        this.userRequest.stop();
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
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userRequest;
    }

    // BUTTONS
    handleEditProfileClick = () => {
        this.setState({ editProfile: true });
    }

    handleEditProfileClose = () => {
        this.setState({ editProfile: false });
    }

    render() {
        const {
            userInformation,
            match,
            activeUser,
        } = this.props;

        const { userId } = match.params;

        const isCurrentUser = parseInt(match.params.userId, 10) === activeUser.userId;

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
                    {
                        isCurrentUser &&
                        <PrimaryButton onClick={this.handleEditProfileClick}>
                            Edit profile
                        </PrimaryButton>
                    }
                    <Modal
                        closeOnEscape
                        onClose={this.handleEditProfileClose}
                        show={this.state.editProfile}
                    >
                        <ModalHeader title="Edit profile" />
                        <ModalBody>
                            <UserEdit
                                userId={userId}
                                userInformation={userInformation}
                                handleModalClose={this.handleEditProfileClose}
                            />
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
                <UserProject match={match} />
                <UserGroup match={match} />
            </div>
        );
    }
}
