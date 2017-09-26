import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import DropdownMenu, { Group, GroupTitle } from '../../../public/components/DropdownMenu';
import LinkOutsideRouter from '../LinkOutsideRouter';
import styles from './styles.scss';
import { pageTitles } from '../../utils/labels';

@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.headerText = 'Aditya Khatri';
        this.navBarItems = [
            {
                linkTo: '/',
                name: pageTitles.dashboard,
                isHeader: true,
                private: true,
            },
            {
                linkTo: '/:projectId/leads',
                name: pageTitles.leads,
                private: true,
            },
            {
                linkTo: '/:projectId/entries',
                name: pageTitles.entries,
                private: true,
            },
            {
                linkTo: '/:projectId/ary',
                name: pageTitles.ary,
                private: true,
            },
            {
                linkTo: '/:projectId/export',
                name: pageTitles.export,
                private: true,
            },
        ];

        this.dropdownItems = {
            group1: {
                items: [
                    {
                        linkTo: '/users/:userId',
                        name: 'User Profile',
                        iconName: 'ion-android-person',
                    },
                    {
                        linkTo: '/countrypanel',
                        name: 'Country Panel',
                        iconName: 'ion-android-globe',
                    },
                    {
                        linkTo: '/admin',
                        name: 'Admin Panel',
                        iconName: 'ion-locked',
                    },
                ],
            },
        };

        this.nonVisibleLinks = [
            '/login',
            '/register',
        ];
    }

    render() {
        const { pathname } = this.props.location;
        if (this.nonVisibleLinks.includes(pathname)) {
            return null;
        }
        return (
            <div styleName="navbar">
                <div styleName="menu-header">
                    <Link
                        to="/"
                        styleName="menu-item"
                    >
                        DEEP
                    </Link>
                </div>
                <div styleName="menu-items">
                    {
                        this.navBarItems.map(item => (
                            item.isHeader || (
                                <Link
                                    key={item.name}
                                    styleName={pathname === item.linkTo ? 'menu-item active' : 'menu-item'}
                                    to={item.linkTo}
                                >
                                    {item.name}
                                </Link>
                            )
                        ))
                    }
                </div>
                <div styleName="dropdown-title">
                    <DropdownMenu className="dropdown-title" title={this.headerText} iconLeft="ion-android-person">
                        {
                            Object.keys(this.dropdownItems).map(key => (
                                <Group
                                    key={key}
                                >
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
                                                        <i
                                                            styleName="item-icon"
                                                        />
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

Navbar.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
};
