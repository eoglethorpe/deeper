import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { List, ListView } from '../../../public/components/View';
import {
    DropdownMenu,
    DropdownGroup,
    DropdownGroupTitle,
} from '../../../public/components/Action';
import { SelectInput } from '../../../public/components/Input';


import LinkOutsideRouter from '../LinkOutsideRouter';
import { pageTitles } from '../../utils/labels';
import logo from '../../../img/black-logo.png';
import styles from './styles.scss';

import { stopTokenRefreshAction } from '../../../common/middlewares/refreshAccessToken';

import {
    logoutAction,
    setActiveProjectAction,

    activeCountrySelector,
    activeProjectSelector,
    activeUserSelector,
    currentUserProjectsSelector,

    navbarActiveLinkSelector,
    navbarValidLinksSelector,
    navbarVisibleSelector,
} from '../../../common/redux';

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    navbarActiveLink: navbarActiveLinkSelector(state),
    navbarValidLinks: navbarValidLinksSelector(state),
    navbarVisible: navbarVisibleSelector(state),
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    stopTokenRefresh: () => dispatch(stopTokenRefreshAction()),
});

const propTypes = {
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    // eslint-disable-next-line
    navbarActiveLink: PropTypes.string,
    // eslint-disable-next-line
    navbarValidLinks: PropTypes.arrayOf(PropTypes.string),
    navbarVisible: PropTypes.bool,
    setActiveProject: PropTypes.func.isRequired,
    stopTokenRefresh: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
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
    activeCountry: undefined,
    navbarValidLinks: [],
    navbarVisible: false,
    activeUser: {},
    userProjects: {},
};

const getValidLinkOrEmpty = value => (value ? `${value}/` : '');

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const {
            activeCountry,
            activeProject,
            activeUser,
        } = this.props;
        const navbarItems = this.createNavbarItems(activeProject);
        const dropdownItems = this.createDropdownItems(
            activeProject,
            activeUser,
            activeCountry,
        );
        this.setState({ navbarItems, dropdownItems });
    }

    componentWillReceiveProps() {
        const {
            activeCountry,
            activeProject,
            activeUser,
        } = this.props;
        const navbarItems = this.createNavbarItems(activeProject);
        const dropdownItems = this.createDropdownItems(
            activeProject,
            activeUser,
            activeCountry,
        );
        this.setState({ navbarItems, dropdownItems });
    }

    onSelectChangeHandler = (key) => {
        this.props.setActiveProject({ activeProject: key });
    }

    handleLogoutButtonClick = () => {
        this.props.stopTokenRefresh();
        this.props.logout();
    }

    labelSelectorForSelectInput = (option = {}) => (option.id)

    keySelectorForSelectInput = (option = {}) => (option.title)

    createNavbarItems = activeProject => [
        {
            linkTo: `/${activeProject}/leads/`,
            name: pageTitles.leads,
            needsProject: true,
        },
        {
            linkTo: `/${activeProject}/entries/`,
            name: pageTitles.entries,
            needsProject: true,
        },
        {
            linkTo: `/${activeProject}/ary/`,
            name: pageTitles.ary,
            needsProject: true,
        },
        {
            linkTo: '/weekly-snapshot/',
            name: pageTitles.weeklySnapshot,
            needsProject: true,
        },
        {
            linkTo: `/${activeProject}/export/`,
            name: pageTitles.export,
            needsProject: true,
        },
    ]

    createDropdownItems = (activeProject, activeUser, activeCountry) => [
        {
            key: 'first-group',
            label: undefined,
            items: [
                {
                    linkTo: `/users/${activeUser.userId}/`,
                    name: pageTitles.userProfile,
                    iconName: 'ion-android-person',
                },
                {
                    linkTo: `/countrypanel/${getValidLinkOrEmpty(activeCountry)}`,
                    name: pageTitles.countryPanel,
                    iconName: 'ion-android-globe',
                },
                {
                    linkTo: `/${activeProject}/projectpanel/`,
                    name: pageTitles.projectPanel,
                    iconName: 'ion-wrench',
                    needsProject: true,
                },
                {
                    linkTo: '/admin/',
                    name: pageTitles.adminPanel,
                    iconName: 'ion-locked',
                },
            ],
        },
    ]

    calcNavbarKey = item => item.name

    calcDropdownGroupKey = group => group.key

    calcDropdownItemKey = item => item.name

    renderNavbarItem = (key, item) => {
        const {
            navbarActiveLink,
            navbarValidLinks,
            userProjects,
        } = this.props;
        if (navbarValidLinks.indexOf(item.name) <= -1) {
            return null;
        }
        if (item.needsProject && userProjects.length <= 0) {
            return null;
        }
        return (
            <Link
                className={navbarActiveLink === item.name ? 'menu-item active' : 'menu-item'}
                key={key}
                to={item.linkTo}
            >
                {item.name}
            </Link>
        );
    }

    renderDropdownGroup = (key, group) => (
        <DropdownGroup key={key} >
            {
                group.label &&
                <DropdownGroupTitle title={group.label} />
            }
            <List
                data={group.items}
                keyExtractor={this.calcDropdownItemKey}
                modifier={this.renderDropdownItem}
            />
        </DropdownGroup>
    )

    renderDropdownItem = (key, item) => {
        const {
            navbarValidLinks,
            userProjects,
        } = this.props;
        if (navbarValidLinks.indexOf(item.name) === -1) {
            return null;
        }
        if (item.needsProject && userProjects.length <= 0) {
            return null;
        }

        return (
            <LinkOutsideRouter
                key={key}
                className={styles['dropdown-item']}
                to={item.linkTo}
            >
                {
                    item.iconName &&
                    <span
                        className={`${item.iconName} ${styles.icon}`}
                    />
                }
                {
                    (!item.iconName) &&
                    <span className={styles.icon} />
                }
                {item.name}
            </LinkOutsideRouter>
        );
    }

    render() {
        console.log('Rendering Navbar');
        const {
            activeProject,
            activeUser,
            navbarVisible,
        } = this.props;
        const {
            navbarItems,
            dropdownItems,
        } = this.state;

        if (!navbarVisible) {
            return null;
        }

        return (
            <div styleName="navbar">
                <Link
                    to="/"
                    styleName="brand"
                >
                    <img
                        styleName="icon"
                        src={logo}
                        alt="DEEP"
                        draggable="false"
                    />
                    <span styleName="title">Deep</span>
                </Link>
                <SelectInput
                    styleName="project-select-input"
                    placeholder="Select Event"
                    keySelector={this.labelSelectorForSelectInput}
                    labelSelector={this.keySelectorForSelectInput}
                    options={this.props.userProjects}
                    value={activeProject}
                    onChange={this.onSelectChangeHandler}
                />
                <ListView
                    data={navbarItems}
                    styleName="menu-items"
                    keyExtractor={this.calcNavbarKey}
                    modifier={this.renderNavbarItem}
                />
                <DropdownMenu
                    styleName="dropdown-menu"
                    className="dropdown-title"
                    iconLeft="ion-android-person"
                    title={activeUser.displayName}
                >
                    <List
                        data={dropdownItems}
                        keyExtractor={this.calcDropdownGroupKey}
                        modifier={this.renderDropdownGroup}
                    />
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
        );
    }
}
