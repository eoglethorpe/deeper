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
import {
    navbarVisibleSelector,
    navbarActiveLinkSelector,
    navbarValidLinksSelector,
} from '../../../common/selectors/navbar';

const mapStateToProps = state => ({
    navbarActiveLink: navbarActiveLinkSelector(state),
    navbarValidLinks: navbarValidLinksSelector(state),
    navbarVisible: navbarVisibleSelector(state),
    user: userSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    stopTokenRefresh: () => dispatch(stopTokenRefreshAction()),
});

const propTypes = {
    logout: PropTypes.func.isRequired,

    // eslint-disable-next-line
    navbarActiveLink: PropTypes.string,
    // eslint-disable-next-line
    navbarValidLinks: PropTypes.arrayOf(PropTypes.string),
    navbarVisible: PropTypes.bool,

    stopTokenRefresh: PropTypes.func.isRequired,
    user: PropTypes.shape({
        userId: PropTypes.number,
    }),
};

const defaultProps = {
    navbarActiveLink: undefined,
    navbarValidLinks: [],
    navbarVisible: false,
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
                linkTo: '/1/leads/',
                name: pageTitles.leads,
                private: true,
            },
            {
                linkTo: '/1/entries/',
                name: pageTitles.entries,
                private: true,
            },
            {
                linkTo: '/1/ary/',
                name: pageTitles.ary,
                private: true,
            },
            {
                linkTo: '/1/export/',
                name: pageTitles.export,
                private: true,
            },
        ];

        this.dropdownItems = [
            {
                key: 'first-group',
                label: undefined,
                items: [
                    {
                        linkTo: `/users/${this.props.user.userId}/`,
                        name: pageTitles.userProfile,
                        iconName: 'ion-android-person',
                    },
                    {
                        linkTo: '/countrypanel/',
                        name: pageTitles.countryPanel,
                        iconName: 'ion-android-globe',
                    },
                    {
                        linkTo: '/admin/',
                        name: pageTitles.adminPanel,
                        iconName: 'ion-locked',
                    },
                ],
            },
        ];
    }

    handleLogoutButtonClick = () => {
        this.props.stopTokenRefresh();
        this.props.logout();
    }

    // TODO: AdityaKhatri: Why Link here?
    renderNavbarItem = (item) => {
        const { navbarActiveLink, navbarValidLinks } = this.props;
        if (navbarValidLinks.indexOf(item.name) === -1) {
            return null;
        }
        return (
            <Link
                key={item.name}
                styleName={navbarActiveLink === item.name ? 'menu-item active' : 'menu-item'}
                to={item.linkTo}
            >
                {item.name}
            </Link>
        );
    }

    // TODO: AdityaKhatri: Why LinkOusideRouter here?
    renderDropdownItem = (item) => {
        const { navbarValidLinks } = this.props;
        if (navbarValidLinks.indexOf(item.name) === -1) {
            return null;
        }

        return (
            <LinkOutsideRouter
                key={item.name}
                styleName="dropdown-item"
                to={item.linkTo}
            >
                {
                    item.iconName &&
                    <span
                        className={item.iconName}
                        styleName="item-icon"
                    />
                }
                {
                    (!item.iconName) &&
                    <span styleName="item-icon" />
                }
                {item.name}
            </LinkOutsideRouter>
        );
    }

    render() {
        const {
            navbarVisible,
            user,
        } = this.props;


        if (!navbarVisible) {
            return null;
        }

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
                    { this.navBarItems.map(this.renderNavbarItem) }
                </div>
                <div styleName="dropdown-title">
                    <DropdownMenu
                        className="dropdown-title"
                        iconLeft="ion-android-person"
                        title={user.displayName}
                    >
                        {
                            this.dropdownItems.map(group => (
                                <Group key={group.key} >
                                    {
                                        group.label &&
                                        <GroupTitle title={group.label} />
                                    }
                                    { group.items.map(this.renderDropdownItem) }
                                </Group>
                            ))
                        }
                        <button
                            styleName="dropdown-item"
                            onClick={this.handleLogoutButtonClick}
                        >
                            <span
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
