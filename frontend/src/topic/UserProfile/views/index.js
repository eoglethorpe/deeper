/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from '../../../public/components/Button';
import Table from '../../../public/components/Table';
import UserProfileEditForm from '../components/UserProfileEditForm';
import Modal, { Header, Body } from '../../../public/components/Modal';
import { pageTitles } from '../../../common/utils/labels';
import styles from './styles.scss';

const mapStateToProps = state => ({
    user: {
        firstName: state.auth.firstName,
        lastName: state.auth.lastName,
        email: state.auth.email,
        displayPicture: state.auth.displayPicture,
    },
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                userId: PropTypes.string,
            }),
        }),
        user: PropTypes.shape({
            email: PropTypes.string,
        }),
    };

    static defaultProps = {
        match: {
            params: {},
        },

        user: {
        },
    };

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
                modifier: row => (
                    (new Date(row.createdOn).toLocaleDateString())
                ),
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
                modifier: row => (
                    (new Date(row.lastModified).toLocaleDateString())
                ),
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

        this.projectData = [
            {
                name: 'Toggle crisis',
                rights: 'Admin',
                createdOn: 1023339302,
                status: 'Active',
                lastModified: 2003320921,
                members: 10,
                actions: 'GG WP',
            },
            {
                name: 'Bibek ko birthday',
                rights: 'Admin',
                createdOn: 1023339302,
                status: 'Active',
                lastModified: 2003320921,
                members: 10,
                actions: 'GG WP',
            },
        ];
    }

    handleEditProfileClick = () => {
        console.log(this.state.editProfile);
        this.setState({
            editProfile: true,
        });
    }

    handleEditProfileClose = () => {
        this.setState({
            editProfile: false,
        });
    }

    render() {
        const { user } = this.props;

        return (
            <div styleName="user-profile">
                <header styleName="header">
                    <h1>{ pageTitles.userProfile } ({ this.props.match.params.userId })</h1>
                    <PrimaryButton
                        onClick={this.handleEditProfileClick}
                    >
                        Edit profile
                    </PrimaryButton>
                    <Modal
                        show={this.state.editProfile}
                        onClose={this.handleEditProfileClose}
                        closeOnEscape
                    >
                        <Header
                            title="Edit profile"
                        />
                        <Body>
                            <UserProfileEditForm
                                onSubmit={() => {}}
                                pending={false}
                            />
                        </Body>
                    </Modal>
                </header>
                <div styleName="info">
                    <img
                        styleName="display-picture"
                        src={user.displayPicture}
                        alt="User avatar"
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
                    <h2>Projects</h2>
                    <Table
                        headers={this.projectHeaders}
                        data={this.projectData}
                    />
                </div>
                <div styleName="groups">
                    <h2>Groups</h2>
                </div>
            </div>
        );
    }
}
