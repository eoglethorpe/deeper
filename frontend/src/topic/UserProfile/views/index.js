/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TransparentPrimaryButton,
} from '../../../public/components/Action';
import {
    Modal,
    ModalBody,
    ModalHeader,
} from '../../../public/components/View';

import GalleryImage from '../../../common/components/GalleryImage';
import {
    UserProject,
    UserGroup,
    UserEdit,
} from '../components/';

import { FgRestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';
import {
    createParamsForUser,
    createUrlForUser,
} from '../../../common/rest';
import {
    tokenSelector,
    userInformationSelector,
    setUserInformationAction,
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
    setUserInformation: params => dispatch(setUserInformationAction(params)),
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
        };
    }

    componentWillMount() {
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
        const userRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
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

        const isCurrentUser = +match.params.userId === activeUser.userId;

        return (
            <div styleName="user-profile">
                <div styleName="info">
                    {/* FIXME: add a default image in img */}
                    <GalleryImage
                        galleryId={userInformation.displayPicture}
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
                                <TransparentPrimaryButton onClick={this.handleEditProfileClick}>
                                    <span className="ion-edit" />
                                </TransparentPrimaryButton>
                            }
                            <Modal
                                closeOnEscape
                                onClose={this.handleEditProfileClose}
                                show={this.state.editProfile}
                                styleName="user-profile-edit-modal"
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
                <UserProject match={match} />
                <UserGroup match={match} />
            </div>
        );
    }
}
