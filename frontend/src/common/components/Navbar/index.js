import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import DropdownMenu, { Group, GroupTitle } from '../../../public/components/DropdownMenu';
import LinkOutsideRouter from '../LinkOutsideRouter';
import logo from '../../../img/black-logo.png';
import SelectInput from '../../../public/components/SelectInput';
import styles from './styles.scss';
import { pageTitles } from '../../utils/labels';
import {
    logoutAction,
} from '../../../common/action-creators/auth';
import {
    setActiveProjectAction,
} from '../../../common/action-creators/domainData';
import {
    stopTokenRefreshAction,
} from '../../../common/middlewares/refreshAccessToken';
import {
    userSelector,
} from '../../../common/selectors/auth';
import {
    currentUserProjectsSelector,
    activeProjectSelector,
} from '../../../common/selectors/domainData';
import {
    navbarVisibleSelector,
    navbarActiveLinkSelector,
    navbarValidLinksSelector,
} from '../../../common/selectors/navbar';


const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    navbarActiveLink: navbarActiveLinkSelector(state),
    navbarValidLinks: navbarValidLinksSelector(state),
    navbarVisible: navbarVisibleSelector(state),
    user: userSelector(state),
    userProjects: currentUserProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    stopTokenRefresh: () => dispatch(stopTokenRefreshAction()),
});

const propTypes = {
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    // eslint-disable-next-line
    navbarActiveLink: PropTypes.string,
    // eslint-disable-next-line
    navbarValidLinks: PropTypes.arrayOf(PropTypes.string),
    navbarVisible: PropTypes.bool,
    setActiveProject: PropTypes.func.isRequired,
    stopTokenRefresh: PropTypes.func.isRequired,
    user: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    navbarActiveLink: undefined,
    activeProject: undefined,
    navbarValidLinks: [],
    navbarVisible: false,
    user: {},
    userProjects: {},
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    onSelectChangeHandler = (key) => {
        console.log('fjdslafjslakjfslkajfsla');
        this.props.setActiveProject({ activeProject: key });
    }

    labelSelectorForSelectInput = option => (option.id)
    keySelectorForSelectInput = option => (option.title)

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
                        styleName="icon"
                    />
                }
                {
                    (!item.iconName) &&
                    <span styleName="icon" />
                }
                {item.name}
            </LinkOutsideRouter>
        );
    }


    render() {
        const {
            navbarVisible,
            user,
            activeProject,
        } = this.props;

        console.log('Rendering Navbar');

        if (!navbarVisible) {
            return null;
        }

        const navBarItems = [
            {
                linkTo: `/${activeProject}/leads/`,
                name: pageTitles.leads,
                private: true,
            },
            {
                linkTo: `/${activeProject}/entries/`,
                name: pageTitles.entries,
                private: true,
            },
            {
                linkTo: `/${activeProject}/ary/`,
                name: pageTitles.ary,
                private: true,
            },
            {
                linkTo: '/weekly-snapshot/',
                name: pageTitles.weeklySnapshot,
                private: true,
            },
            {
                linkTo: `/${activeProject}/export/`,
                name: pageTitles.export,
                private: true,
            },
        ];

        const dropdownItems = [
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
                        linkTo: '/projectpanel/',
                        name: pageTitles.projectPanel,
                        iconName: 'ion-wrench',
                    },
                    {
                        linkTo: '/admin/',
                        name: pageTitles.adminPanel,
                        iconName: 'ion-locked',
                    },
                ],
            },
        ];
        return (
            <div styleName="navbar">
                <div styleName="menu-header">
                    <Link
                        to="/"
                        styleName="menu-item"
                    >
                        <img src={logo} alt="DEEP" />
                        <h3>Deep</h3>
                    </Link>
                </div>
                <div styleName="project-select-container">
                    <SelectInput
                        styleName="project-select-input"
                        placeholder="Select Event"
                        keySelector={this.labelSelectorForSelectInput}
                        labelSelector={this.keySelectorForSelectInput}
                        options={this.props.userProjects}
                        selectedOptionKey={activeProject}
                        onChange={this.onSelectChangeHandler}
                    />
                </div>
                <div styleName="menu-items">
                    { navBarItems.map(this.renderNavbarItem) }
                </div>
                <div styleName="dropdown-title">
                    <DropdownMenu
                        className="dropdown-title"
                        iconLeft="ion-android-person"
                        title={user.displayName}
                    >
                        {
                            dropdownItems.map(group => (
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
                                styleName="icon"
                            />
                            Logout
                        </button>
                    </DropdownMenu>
                </div>
            </div>
        );
    }
}
