import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
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
import logo from '../../../img/black-logo.png';

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

    // UTILS

    getCurrentMatch = () => {
        const { location } = this.props;

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

    // NAV links

    getValidNavLinks = (currentPath) => {
        const currentValidLinks = validLinks[currentPath];

        const navLinks = [
            'leads',
            'entries',
            'ary',
            'projects',
            'countries',
            'analysisFramework',
            'export',
        ];

        const validNavLinks = navLinks.filter(
            link => currentValidLinks.findIndex(d => d === link) !== -1,
        );

        return validNavLinks;
    }

    // DROPDOWN links

    getValidDropLinks = (currentPath) => {
        const currentValidLinks = validLinks[currentPath];

        const dropLinks = [
            'apiDocs',
            'userProfile',
            'categoryEditor',
            'adminPanel',
        ];

        const validDropLinks = dropLinks.filter(
            link => currentValidLinks.findIndex(d => d === link) !== -1,
        );

        return validDropLinks;
    }

    getDropItemKey = item => item

    getDropItem = (item) => {
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
            categoryEditor: iconNames.text,
            adminPanel: iconNames.locked,
        };
        const iconName = dropdownItemIcons[item];

        // TODO: specify requireLogin and requireProject for each item
        return (
            <Cloak
                key={item}
                requireLogin
                requireProject
            >
                <Link
                    to={reverseRoute(pathNames[item], params)}
                    className={styles['dropdown-item']}
                >
                    {
                        iconName &&
                        <span
                            className={`${iconName} ${styles.icon}`}
                        />
                    }
                    { pageTitles[item] }
                </Link>
            </Cloak>
        );
    }

    // LOGOUT button

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    // SELECT input

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    selectProjectKey = (option = {}) => (option.id)

    selectProjectLabel = (option = {}) => (option.title)

    render() {
        const {
            activeProject,
            activeCountry,
            activeUser,
            userProjects,
            userInformation,
        } = this.props;


        const match = this.getCurrentMatch();
        const currentPath = match ? getKeyByValue(pathNames, match.path) : 'fourHundredFour';
        console.log(currentPath);
        if (hideNavbar[currentPath]) {
            return null;
        }

        const userName = userInformation.displayName || activeUser.displayName || 'Anon';
        return (
            <nav
                styleName="navbar"
            >
                <Link
                    to={reverseRoute(pathNames.homeScreen, {})}
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

                <Cloak
                    requireLogin
                    requireProject
                >
                    <SelectInput
                        clearable={false}
                        keySelector={this.selectProjectKey}
                        labelSelector={this.selectProjectLabel}
                        onChange={this.handleProjectChange}
                        options={userProjects}
                        placeholder="Select Event"
                        showHintAndError={false}
                        showLabel={false}
                        styleName="project-select-input"
                        value={activeProject}
                    />
                </Cloak>

                <NavMenu
                    links={this.getValidNavLinks(currentPath)}
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
                            data={this.getValidDropLinks(currentPath)}
                            keyExtractor={this.getDropItemKey}
                            modifier={this.getDropItem}
                        />
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
                                    className="ion-log-out"
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
