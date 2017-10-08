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
import { PrimaryButton } from '../../../public/components/Button';
import { pageTitles } from '../../../common/utils/labels';
import {
    userSelector,
} from '../../../common/selectors/auth';
import {
    projectsSelector,
} from '../../../common/selectors/domainData';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    user: PropTypes.object, // eslint-disable-line
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


        console.log(this.props.match.params.userId);
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
