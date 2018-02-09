/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import PrimaryButton from '../../../public/components/Action/Button/PrimaryButton';
import Modal from '../../../public/components/View/Modal';
import ModalBody from '../../../public/components/View/Modal/Body';
import ModalHeader from '../../../public/components/View/Modal/Header';
import LoadingAnimation from '../../../public/components/View/LoadingAnimation';

import { InternalGallery } from '../../../common/components/DeepGallery';
import {
    createParamsForUser,
    createUrlForUser,
} from '../../../common/rest';
import {
    userInformationSelector,
    setUserInformationAction,
    unsetUserAction,
    activeUserSelector,
    userIdFromRouteSelector,

    userStringsSelector,
} from '../../../common/redux';
import schema from '../../../common/schema';
import { iconNames } from '../../../common/constants';

import {
    UserProject,
    UserGroup,
    UserEdit,
} from '../components/';
import styles from './styles.scss';

const propTypes = {
    setUserInformation: PropTypes.func.isRequired,
    unsetUser: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userId: PropTypes.number.isRequired,

    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};


const mapStateToProps = (state, props) => ({
    userInformation: userInformationSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
    unsetUser: params => dispatch(unsetUserAction(params)),
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
            pending: true,
        };
    }

    componentDidMount() {
        const { userId } = this.props;
        this.userRequest = this.createRequestForUser(userId);
        this.userRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
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
        const userRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
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
                if (response.errorCode === 404) {
                    this.props.unsetUser({ userId });
                } else {
                    console.info('FAILURE:', response);
                }
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
            userId,
            activeUser,
        } = this.props;

        const { pending } = this.state;

        const isCurrentUser = userId === activeUser.userId;

        if (pending) {
            return (
                <div styleName="user-profile">
                    <LoadingAnimation />
                </div>
            );
        }

        if (!userInformation.id) {
            return (
                <div styleName="user-profile">
                    <div styleName="user-detail-alt">
                        {this.props.userStrings('userNotFound')}
                    </div>
                </div>
            );
        }

        return (
            <div styleName="user-profile">
                <header styleName="header">
                    <h2>User Profile</h2>
                </header>
                <div styleName="info">
                    {/* FIXME: add a default image in img */}
                    <InternalGallery
                        galleryId={userInformation.displayPicture}
                        notFoundMessage={this.props.userStrings('userImageNotFound')}
                        styleName="display-picture"
                    />
                    <div styleName="detail">
                        <div styleName="name">
                            <div>
                                <span styleName="first">
                                    { userInformation.firstName }
                                </span>
                                <span styleName="last">
                                    { userInformation.lastName }
                                </span>
                            </div>
                            {
                                isCurrentUser &&
                                    <PrimaryButton
                                        onClick={this.handleEditProfileClick}
                                        transparent
                                    >
                                        <span className={iconNames.edit} />
                                    </PrimaryButton>
                            }
                            { this.state.editProfile &&
                                <Modal
                                    closeOnEscape
                                    onClose={this.handleEditProfileClose}
                                    styleName="user-profile-edit-modal"
                                >
                                    <ModalHeader
                                        title={this.props.userStrings('editProfileModalHeader')}
                                        rightComponent={
                                            <PrimaryButton
                                                onClick={this.handleEditProfileClose}
                                                transparent
                                            >
                                                <span className={iconNames.close} />
                                            </PrimaryButton>
                                        }
                                    />
                                    <ModalBody>
                                        <UserEdit
                                            userId={userId}
                                            userInformation={userInformation}
                                            handleModalClose={this.handleEditProfileClose}
                                        />
                                    </ModalBody>
                                </Modal>
                            }
                        </div>
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
                <UserProject styleName="projects" />
                <UserGroup styleName="groups" />
            </div>
        );
    }
}
