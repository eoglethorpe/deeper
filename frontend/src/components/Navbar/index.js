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


import { BgRestBuilder } from '../../vendor/react-store/utils/rest';
import {
    isTruthy,
    reverseRoute,
} from '../../vendor/react-store/utils/common';
import List from '../../vendor/react-store/components/View/List';
import DropdownMenu from '../../vendor/react-store/components/Action/DropdownMenu';
import DropdownGroup from '../../vendor/react-store/components/Action/DropdownMenu/Group';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';

import { stopSiloBackgroundTasksAction } from '../../redux/middlewares/siloBackgroundTasks';
import { stopRefreshAction } from '../../redux/middlewares/refresher';
import { adminEndpoint } from '../../config/rest';
import {
    createUrlForSetUserProject,
    createParamsForSetUserProject,
} from '../../rest';
import {
    logoutAction,
    setActiveProjectAction,

    activeCountrySelector,
    activeProjectSelector,
    activeUserSelector,
    currentUserInformationSelector,
    currentUserProjectsSelector,

    commonStringsSelector,
    pageTitleStringsSelector,
} from '../../redux';

import {
    iconNames,
    pathNames,
    validLinks,
    hideNavbar,
} from '../../constants';
import logo from '../../resources/img/deep-logo-simplified.svg';

import Cloak from '../Cloak';
import NavMenu from './NavMenu';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
    userProjects: currentUserProjectsSelector(state),
    commonStrings: commonStringsSelector(state),
    pageTitleStrings: pageTitleStringsSelector(state),
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
    userInformation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
    commonStrings: PropTypes.func.isRequired,
    pageTitleStrings: PropTypes.func.isRequired,
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

    static dropdownItemIcons = {
        apiDocs: iconNames.code,
        userProfile: iconNames.person,
        stringManagement: iconNames.world,
        projects: iconNames.map,
        countries: iconNames.globe,
    };

    static getDropItemKey = item => item.key

    static projectKeySelector = (option = {}) => (option.id)
    static projectLabelSelector = (option = {}) => (option.title)

    static getCurrentMatch = (location) => {
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

    static getValidLinks = (navLinks, currentPath) => {
        const currentValidLinks = validLinks[currentPath];
        return navLinks
            .map(link => ({ key: link, ...currentValidLinks[link] }))
            .filter(d => !!d);
    }

    constructor(props) {
        super(props);
        this.setLinksForLocation(props.location);
    }

    componentWillReceiveProps(nextProps) {
        // TODO: move this block to reducers of siloDomainData:common
        const { userProjects: oldUserProjects } = this.props;
        const {
            userProjects: newUserProjects,
            activeProject,
            userProjects,
        } = nextProps;
        // If active project has changed, then set active project
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

        // Set user project in server
        const { activeProject: oldActiveProject } = this.props;
        const { activeProject: newActiveProject, activeUser: newActiveUser } = nextProps;
        if (oldActiveProject !== newActiveProject) {
            console.warn('Project id changed from ', oldActiveProject, 'to', newActiveProject);

            if (this.setUserProjectRequest) {
                this.setUserProjectRequest.stop();
            }
            this.setUserProjectRequest = new BgRestBuilder()
                .url(createUrlForSetUserProject(newActiveUser.userId))
                .params(() => createParamsForSetUserProject(newActiveProject))
                .delay(1000) // more delay
                .success(() => {
                    console.warn('Successfully patched user project');
                })
                .failure((response) => {
                    console.error('FAILURE: Failed to patch user project', response);
                })
                .fatal(() => {
                    console.error('FATAL: Failed to patch user project');
                })
                .build();
            this.setUserProjectRequest.start();
        }

        const { location: oldLocation } = this.props;
        const { location: newLocation } = nextProps;
        if (oldLocation !== newLocation) {
            this.setLinksForLocation(newLocation);
        }
    }

    componentWillUnmount() {
        if (this.setUserProjectRequest) {
            this.setUserProjectRequest.stop();
        }
    }

    setLinksForLocation = (location) => {
        this.currentMatch = Navbar.getCurrentMatch(location);
        this.currentPath = this.currentMatch
            ? getKeyByValue(pathNames, this.currentMatch.path)
            : 'fourHundredFour';

        const navLinks = [
            'leads',
            'entries',
            'export',
            'ary',
        ];

        const dropLinks = [
            'userProfile',
            'projects',
            'countries',
            'stringManagement',
            'apiDocs',
        ];

        this.validNavLinks = Navbar.getValidLinks(navLinks, this.currentPath);
        this.validDropLinks = Navbar.getValidLinks(dropLinks, this.currentPath);
    }

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    renderDropItem = (key, item) => {
        const {
            activeProject,
            activeCountry,
            activeUser = {},
        } = this.props;

        const params = {
            projectId: activeProject,
            countryId: activeCountry,
            userId: activeUser.userId,
        };

        const iconName = Navbar.dropdownItemIcons[key];

        return (
            <Cloak
                key={key}
                requireLogin={item.requireLogin}
                requireAdminRights={item.requireAdminRights}
                requireProject={item.requireProject}
                requireDevMode={item.requireDevMode}
                render={() => (
                    <Link
                        to={reverseRoute(pathNames[key], params)}
                        className={styles['dropdown-item']}
                    >
                        { iconName && <span className={`${iconName} ${styles.icon}`} />}
                        { this.props.pageTitleStrings(key) }
                    </Link>
                )}
            />
        );
    }

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

        const userName = (
            userInformation.displayName ||
            activeUser.displayName ||
            this.props.commonStrings('anonymousLabel')
        );
        return (
            <nav
                className={className}
                styleName="navbar"
            >
                <Link
                    to={reverseRoute(pathNames.homeScreen, {})}
                    styleName="brand"
                >
                    <ReactSVG
                        wrapperClassName={styles['icon-wrapper']}
                        className={styles.icon}
                        path={logo}
                    />
                    <div styleName="title">
                        {this.props.commonStrings('deepLabel')}
                    </div>
                    <span styleName="beta-label">
                        {this.props.commonStrings('betaLabel')}
                    </span>
                </Link>
                <Cloak
                    requireLogin={projectSelectInputLink.requireLogin}
                    requireAdminRights={projectSelectInputLink.requireAdminRights}
                    requireProject={projectSelectInputLink.requireProject}
                    requireDevMode={projectSelectInputLink.requireDevMode}
                    render={
                        () => (
                            <SelectInput
                                hideClearButton
                                keySelector={Navbar.projectKeySelector}
                                labelSelector={Navbar.projectLabelSelector}
                                onChange={this.handleProjectChange}
                                options={userProjects}
                                placeholder={this.props.commonStrings('selectEventPlaceholder')}
                                showHintAndError={false}
                                showLabel={false}
                                className={styles['project-select-input']}
                                disabled={
                                    userProjects.length <= 0 || projectSelectInputLink.disable
                                }
                                value={activeProject}
                            />
                        )
                    }
                />

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
                            keyExtractor={Navbar.getDropItemKey}
                            modifier={this.renderDropItem}
                        />
                        <Cloak
                            requireLogin={adminPanelLink.requireLogin}
                            requireAdminRights={adminPanelLink.requireAdminRights}
                            requireProject={adminPanelLink.requireProject}
                            requireDevMode={adminPanelLink.requireDevMode}
                            render={
                                () => (
                                    <a
                                        className={styles['dropdown-item']}
                                        href={adminEndpoint}
                                        target="_blank"
                                    >
                                        <span className={`${styles.icon} ${iconNames.locked}`} />
                                        {this.props.commonStrings('adminPanelLabel')}
                                    </a>
                                )
                            }
                        />
                    </DropdownGroup>
                    <Link
                        target="_blank"
                        className={styles['dropdown-item']}
                        to="https://chrome.google.com/webstore/detail/deep-2-add-lead/kafonkgglonkbldmcigbdojiadfcmcdc"
                    >
                        <span className={`${styles.icon} ${iconNames.chrome}`} />
                        { this.props.pageTitleStrings('browserExtension') }
                    </Link>
                    <Cloak
                        requireLogin
                        render={
                            () => (
                                <DropdownGroup>
                                    <button
                                        className={styles['dropdown-item']}
                                        onClick={this.handleLogoutButtonClick}
                                    >
                                        <span className={`${styles.icon} ${iconNames.logout}`} />
                                        {this.props.commonStrings('logoutLabel')}
                                    </button>
                                </DropdownGroup>
                            )
                        }
                    />
                </DropdownMenu>
            </nav>
        );
    }
}
