/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import { InternalGallery } from '../../components/DeepGallery';
import {
    userInformationSelector,
    setUserInformationAction,
    unsetUserAction,
    activeUserSelector,
    userIdFromRouteSelector,
} from '../../redux';
import _ts from '../../ts';
import { iconNames } from '../../constants';

import UserGetRequest from './requests/UserGetRequest';
import UserProject from './UserProject';
import UserGroup from './UserGroup';
import UserEdit from './UserEdit';

import styles from './styles.scss';

const propTypes = {
    setUserInformation: PropTypes.func.isRequired,
    unsetUser: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userId: PropTypes.number.isRequired,
};

const defaultProps = {
};


const mapStateToProps = (state, props) => ({
    userInformation: userInformationSelector(state, props),
    activeUser: activeUserSelector(state),
    userId: userIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
    unsetUser: params => dispatch(unsetUserAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
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
        this.startRequestForUser(userId);
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps;
        if (this.props.userId !== userId) {
            this.startRequestForUser(userId);
        }
    }

    componentWillUnmount() {
        if (this.userRequest) {
            this.userRequest.stop();
        }
    }

    startRequestForUser = (userId) => {
        if (this.userRequest) {
            this.userRequest.stop();
        }
        const userRequest = new UserGetRequest({
            unsetUser: this.props.unsetUser,
            setUserInformation: this.props.setUserInformation,
            setState: v => this.setState(v),
        });
        this.userRequest = userRequest.create(userId);
        this.userRequest.start();
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
                <div className={styles.userProfile}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!userInformation.id) {
            return (
                <div className={styles.userProfile}>
                    <div className={styles.userDetailAlt}>
                        {_ts('user', 'userNotFound')}
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.userProfile}>
                <header className={styles.header}>
                    <h2>User Profile</h2>
                </header>
                <div className={styles.info}>
                    {/* FIXME: add a default image in img */}
                    <InternalGallery
                        galleryId={userInformation.displayPicture}
                        notFoundMessage={_ts('user', 'userImageNotFound')}
                        className={styles.displayPicture}
                    />
                    <div className={styles.detail}>
                        <div className={styles.name}>
                            <div>
                                <span className={styles.first}>
                                    { userInformation.firstName }
                                </span>
                                <span className={styles.last}>
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
                                    className={styles.userProfileEditModal}
                                >
                                    <ModalHeader
                                        title={_ts('user', 'editProfileModalHeader')}
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
                        <p className={styles.email}>
                            { userInformation.email }
                        </p>
                        <p className={styles.organization}>
                            { userInformation.organization }
                        </p>
                    </div>
                </div>
                <div className={styles.stats}>
                    <h2>Stats</h2>
                </div>
                <UserProject className={styles.projects} />
                <UserGroup className={styles.groups} />
            </div>
        );
    }
}
