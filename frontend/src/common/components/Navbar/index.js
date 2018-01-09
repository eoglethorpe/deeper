import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import {
    withRouter,
    Link,
    matchPath,
} from 'react-router-dom';
import { List } from '../../../public/components/View';
import {
    DropdownMenu,
    DropdownGroup,
} from '../../../public/components/Action';
import { SelectInput } from '../../../public/components/Input';
import {
    isTruthy,
    reverseRoute,
} from '../../../public/utils/common';

import {
    stopSiloBackgroundTasksAction,
} from '../../../common/middlewares/siloBackgroundTasks';
import {
    stopRefreshAction,
} from '../../../common/middlewares/refresher';
import {
    adminEndpoint,
} from '../../../common/config/rest';

import {
    logoutAction,
    setActiveProjectAction,

    activeCountrySelector,
    activeProjectSelector,
    activeUserSelector,
    currentUserInformationSelector,
    currentUserProjectsSelector,
} from '../../../common/redux';

import {
    iconNames,
    pageTitles,
    pathNames,
    validLinks,
    hideNavbar,
} from '../../constants';

import Cloak from '../Cloak';
import logo from '../../../img/deep-logo-simplified.svg';

import NavMenu from './NavMenu';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
    userProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    stopRefresh: () => dispatch(stopRefreshAction()),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
});

const propTypes = {
    className: PropTypes.string,
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    setActiveProject: PropTypes.func.isRequired,
    stopRefresh: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userInformation: PropTypes.object, // eslint-disable-line
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    className: '',
    activeProject: undefined,
    activeCountry: undefined,
    activeUser: {},
    userProjects: [],
    userInformation: {},
};

const getKeyByValue = (object, value) => (
    Object.keys(object).find(key => object[key] === value)
);

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.setLinksForLocation(props.location);
    }

    componentWillReceiveProps(nextProps) {
        const { userProjects: oldUserProjects } = this.props;
        const {
            userProjects: newUserProjects,
            activeProject,
            userProjects,
        } = nextProps;

        // NOTE: if active project id is not in userProjects,
        // then set first project id from users project
        if (oldUserProjects !== newUserProjects) {
            const activeProjectIndex = newUserProjects.findIndex(
                p => p.id === activeProject,
            );
            if (activeProjectIndex === -1) {
                this.props.setActiveProject({
                    activeProject: (newUserProjects.length > 0) ? userProjects[0].id : undefined,
                });
            }
        }

        const { location: oldLocation } = this.props;
        const { location: newLocation } = nextProps;
        if (oldLocation !== newLocation) {
            this.setLinksForLocation(newLocation);
        }
    }

    setLinksForLocation = (location) => {
        this.currentMatch = this.getCurrentMatch(location);
        this.currentPath = this.currentMatch
            ? getKeyByValue(pathNames, this.currentMatch.path)
            : 'fourHundredFour';
        this.validNavLinks = this.getValidNavLinks(this.currentPath);
        this.validDropLinks = this.getValidDropLinks(this.currentPath);
        console.warn(this.validDropLinks);
    }

    // UTILS

    getCurrentMatch = (location) => {
        const links = Object.keys(pathNames);
        const paths = Object.values(pathNames);

        for (let i = 0; i < links.length; i += 1) {
            const match = matchPath(location.pathname, {
                path: paths[i],
                exact: true,
            });

            if (match) {
                return match;
            }
        }

        return null;
    }

    getValidNavLinks = (currentPath) => {
        const navLinks = [
            'leads',
            'entries',
            'ary',
            'projects',
            'countries',
            'export',
        ];

        const currentValidLinks = validLinks[currentPath];
        const validNavLinks = navLinks
            .map(link => ({ key: link, ...currentValidLinks[link] }))
            .filter(d => !!d);
        return validNavLinks;
    }

    getValidDropLinks = (currentPath) => {
        const dropLinks = [
            'userProfile',
        ];
        // Don't show apiDocs in production
        if (process.env.NODE_ENV === 'development') {
            dropLinks.push('apiDocs');
        }

        const currentValidLinks = validLinks[currentPath];
        const validDropLinks = dropLinks
            .map(link => ({ key: link, ...currentValidLinks[link] }))
            .filter(d => !!d);
        return validDropLinks;
    }

    // DROPDOWN

    getDropItemKey = item => item.key

    getDropItem = (key, item) => {
        const {
            activeProject,
            activeCountry,
            activeUser = {},
        } = this.props;

        const params = {
            projectId: activeProject,
            countryId: activeCountry,
            userId: activeUser.userId,
            analysisFrameworkId: 1,
        };

        const dropdownItemIcons = {
            apiDocs: iconNames.code,
            userProfile: iconNames.person,
        };

        console.warn(item);

        const iconName = dropdownItemIcons[key];
        const link = reverseRoute(pathNames[key], params);

        return (
            <Cloak
                key={key}
                requireLogin={item.requireLogin}
                requireAdminRights={item.requireAdminRights}
                requireProject={item.requireProject}
            >
                <Link
                    to={link}
                    className={styles['dropdown-item']}
                >
                    {
                        iconName &&
                        <span className={`${iconName} ${styles.icon}`} />
                    }
                    { pageTitles[key] }
                </Link>
            </Cloak>
        );
    }

    // LOGOUT

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    // SELECTINPUT

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({
                activeProject: key,
            });
        }
    }

    projectKeySelector = (option = {}) => (option.id)
    projectLabelSelector = (option = {}) => (option.title)

    render() {
        const {
            className,
            activeProject,
            activeCountry,
            activeUser,
            userProjects,
            userInformation,
        } = this.props;

        // Hide navbar
        if (hideNavbar[this.currentPath]) {
            return <span className="no-nav" />;
        }

        const currentValidLinks = validLinks[this.currentPath];
        const projectSelectInputLink = currentValidLinks.projectSelect;
        const adminPanelLink = currentValidLinks.adminPanel;

        const linkToHomeScreen = reverseRoute(pathNames.homeScreen, {});
        const userName = userInformation.displayName || activeUser.displayName || 'Anon';
        return (
            <nav
                className={className}
                styleName="navbar"
            >
                <Link
                    to={linkToHomeScreen}
                    styleName="brand"
                >
                    <ReactSVG
                        wrapperClassName={styles['icon-wrapper']}
                        className={styles.icon}
                        path={logo}
                    />
                    <span styleName="title">
                        Deep
                    </span>
                </Link>

                <Cloak
                    requireLogin={projectSelectInputLink.requireLogin}
                    requireAdminRights={projectSelectInputLink.requireAdminRights}
                    requireProject={projectSelectInputLink.requireAdminRights}
                >
                    <SelectInput
                        clearable={false}
                        keySelector={this.projectKeySelector}
                        labelSelector={this.projectLabelSelector}
                        onChange={this.handleProjectChange}
                        options={userProjects}
                        placeholder="Select Event"
                        showHintAndError={false}
                        showLabel={false}
                        styleName="project-select-input"
                        disabled={userProjects.length <= 0}
                        value={activeProject}
                    />
                </Cloak>

                <NavMenu
                    links={this.validNavLinks}
                    styleName="main-menu"
                    projectId={activeProject}
                    countryId={activeCountry}
                />

                <DropdownMenu
                    styleName="user-menu"
                    iconName={iconNames.person}
                    title={userName}
                >
                    <DropdownGroup>
                        <List
                            data={this.validDropLinks}
                            keyExtractor={this.getDropItemKey}
                            modifier={this.getDropItem}
                        />
                        <Cloak
                            requireLogin={adminPanelLink.requireLogin}
                            requireAdminRights={adminPanelLink.requireAdminRights}
                            requireProject={adminPanelLink.requireProject}
                        >
                            <a
                                styleName="dropdown-item"
                                href={adminEndpoint}
                                target="_blank"
                            >
                                <span
                                    className={iconNames.locked}
                                    styleName="icon"
                                />
                                Admin Panel
                            </a>
                        </Cloak>
                    </DropdownGroup>
                    <Cloak
                        requireLogin
                    >
                        <DropdownGroup>
                            <button
                                styleName="dropdown-item"
                                onClick={this.handleLogoutButtonClick}
                            >
                                <span
                                    className={iconNames.logout}
                                    styleName="icon"
                                />
                                Logout
                            </button>
                        </DropdownGroup>
                    </Cloak>
                </DropdownMenu>
            </nav>
        );
    }
}
