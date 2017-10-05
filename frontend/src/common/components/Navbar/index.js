import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import DropdownMenu, { Group, GroupTitle } from '../../../public/components/DropdownMenu';
import LinkOutsideRouter from '../LinkOutsideRouter';
import styles from './styles.scss';
import { pageTitles } from '../../utils/labels';
import { logoutAction } from '../../../common/action-creators/auth';
import {
    stopTokenRefreshAction,
} from '../../../common/middlewares/refreshAccessToken';
import {
    userSelector,
} from '../../../common/selectors/auth';

const mapStateToProps = state => ({
    user: userSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    stopTokenRefresh: () => dispatch(stopTokenRefreshAction()),
});

const propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    logout: PropTypes.func.isRequired,
    stopTokenRefresh: PropTypes.func.isRequired,
    user: PropTypes.shape({
        email: PropTypes.string,
    }),
};

const defaultProps = {
    user: {},
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.navBarItems = [
            {
                linkTo: '/:projectId/leads/',
                name: pageTitles.leads,
                private: true,
            },
            {
                linkTo: '/:projectId/entries/',
                name: pageTitles.entries,
                private: true,
            },
            {
                linkTo: '/:projectId/ary/',
                name: pageTitles.ary,
                private: true,
            },
            {
                linkTo: '/:projectId/export/',
                name: pageTitles.export,
                private: true,
            },
        ];

        this.dropdownItems = {
            group1: {
                items: [
                    {
                        linkTo: '/users/me/',
                        name: 'User Profile',
                        iconName: 'ion-android-person',
                    },
                    {
                        linkTo: '/countrypanel/',
                        name: 'Country Panel',
                        iconName: 'ion-android-globe',
                    },
                    {
                        linkTo: '/admin/',
                        name: 'Admin Panel',
                        iconName: 'ion-locked',
                    },
                ],
            },
        };

        this.nonVisibleLinks = [
            '/login/',
            '/register/',
        ];
    }

    handleLogoutButtonClick = () => {
        this.props.stopTokenRefresh();
        this.props.logout();
    }

    render() {
        const { pathname } = this.props.location;
        // If current pathname is inside nonVisibleLinks, don't show navbar
        if (this.nonVisibleLinks.includes(pathname)) {
            return null;
        }
        const { user } = this.props;

        return (
            <div styleName="navbar">
                <div styleName="menu-header">
                    <Link
                        to="/"
                        styleName="menu-item"
                    >
                        Deep
                    </Link>
                </div>
                <div styleName="menu-items">
                    {
                        this.navBarItems.map(item => (
                            <Link
                                key={item.name}
                                styleName={pathname === item.linkTo ? 'menu-item active' : 'menu-item'}
                                to={item.linkTo}
                            >
                                {item.name}
                            </Link>
                        ))
                    }
                </div>
                <div styleName="dropdown-title">
                    <DropdownMenu
                        className="dropdown-title"
                        iconLeft="ion-android-person"
                        title={`${user.firstName || ''} ${user.lastName || ''}`}
                    >
                        {
                            Object.keys(this.dropdownItems).map(key => (
                                <Group key={key} >
                                    <div>
                                        {
                                            !this.dropdownItems[key].label ||
                                                <GroupTitle title={this.dropdownItems[key].label} />
                                        }
                                        {
                                            this.dropdownItems[key].items.map(item => (
                                                <LinkOutsideRouter
                                                    key={item.name}
                                                    styleName="dropdown-item"
                                                    to={item.linkTo}
                                                >
                                                    { item.iconName !== '' &&
                                                        <i
                                                            className={item.iconName}
                                                            styleName="item-icon"
                                                        />
                                                    }
                                                    { item.iconName === '' &&
                                                        <i styleName="item-icon" />
                                                    }
                                                    {item.name}
                                                </LinkOutsideRouter>
                                            ))
                                        }
                                    </div>
                                </Group>
                            ))
                        }
                        <button
                            styleName="dropdown-item"
                            onClick={this.handleLogoutButtonClick}
                        >
                            <i
                                className="ion-log-out"
                                styleName="item-icon"
                            />
                            Logout
                        </button>
                    </DropdownMenu>
                </div>
            </div>
        );
    }
}
