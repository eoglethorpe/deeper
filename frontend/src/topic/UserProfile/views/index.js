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
    userSelector,
} from '../../../common/selectors/auth';
import {
    projectsSelector,
} from '../../../common/selectors/domainData';

import {
    createParamsForUser,
    createUrlForUser,
} from '../../../common/rest';

import schema from '../../../common/schema';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    user: PropTypes.object, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    projects: PropTypes.array, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    user: { },
    projects: [],
};


const mapStateToProps = state => ({
    user: userSelector(state),
    projects: projectsSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            editProfile: false,
        };

        this.projectHeaders = [
            {
                key: 'name',
                label: 'Name',
                order: 1,
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 2,
            },
            {
                key: 'createdOn',
                label: 'Created on',
                order: 3,
                modifier: row => <FormattedDate date={row.createdOn} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'status',
                label: 'Status',
                order: 4,
            },
            {
                key: 'lastModified',
                label: 'Last Modified',
                order: 5,
                modifier: row => <FormattedDate date={row.lastModified} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'members',
                label: 'Members',
                order: 6,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
            },
        ];

        const { match } = this.props;
        const userId = match.params.userId;

        const urlForUser = createUrlForUser(userId);
        this.userRequest = new RestBuilder()
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
                    schema.validate(response, 'getUserResponse');

                    // dispatch here
                    console.log(response);
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
    }

    componentWillMount() {
        this.userRequest.start();
    }

    componentWillUnmount() {
        this.userRequest.stop();
    }

    handleEditProfileClick = () => {
        console.log(this.state.editProfile);
        this.setState({ editProfile: true });
    }

    handleEditProfileClose = () => {
        this.setState({ editProfile: false });
    }

    render() {
        const { user } = this.props;


        return (
            <div styleName="user-profile">
                <Helmet>
                    <title>{ pageTitles.userProfile }</title>
                </Helmet>
                <header styleName="header">
                    <h1>
                        { pageTitles.userProfile } ({ user.id })
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
                                onSubmit={() => {}}
                                pending={false}
                            />
                        </Body>
                    </Modal>
                </header>
                <div styleName="info">
                    {/* FIXME: add a default image in img */}
                    <img
                        alt="User avatar"
                        src={user.displayPicture || 'https://i.imgur.com/yJP07D6.png'}
                        styleName="display-picture"
                    />
                    <div styleName="detail">
                        <p styleName="name">
                            <span styleName="first">
                                { user.firstName }
                            </span>
                            <span styleName="last">
                                { user.lastName }
                            </span>
                        </p>
                        <p styleName="email">
                            { user.email }
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
                        data={this.props.projects}
                        headers={this.projectHeaders}
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
