import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    withRouter,
    Link,
} from 'react-router-dom';
import { List } from '../../../public/components/View';
import {
    DropdownMenu,
    DropdownGroup,
    DropdownGroupTitle,
} from '../../../public/components/Action';
import { SelectInput } from '../../../public/components/Input';
import { isTruthy } from '../../../public/utils/common';

import {
    pageTitles,
    pathNames,
} from '../../constants';


import LinkOutsideRouter from '../LinkOutsideRouter';
import logo from '../../../img/black-logo.png';
import styles from './styles.scss';

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

    navbarActiveLinkSelector,
    navbarValidLinksSelector,
    navbarVisibleSelector,
} from '../../../common/redux';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    navbarActiveLink: navbarActiveLinkSelector(state),
    navbarValidLinks: navbarValidLinksSelector(state),
    navbarVisible: navbarVisibleSelector(state),
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
    // eslint-disable-next-line
    navbarActiveLink: PropTypes.string,
    // eslint-disable-next-line
    navbarValidLinks: PropTypes.arrayOf(PropTypes.string),
    navbarVisible: PropTypes.bool,
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
};

const defaultProps = {
    navbarActiveLink: undefined,
    activeProject: undefined,
    activeCountry: undefined,
    navbarValidLinks: [],
    navbarVisible: false,
    activeUser: {},
    userProjects: {},
    userInformation: {},
};

const getValidLinkOrEmpty = value => (value ? `${value}/` : '');

const reverseRoute = (route, params) => {
    const paths = route.split('/');

    for (let i = 0; i < paths.length; i += 1) {
        let path = paths[i];

        if (path && path.length > 0 && path.charAt(0) === ':') {
            path = path.substring(1);
            let param;

            // optional parameter
            if (path.slice(-1) === '?') {
                param = params[path.replace('?', '')];

                // omit if value not supplied
                if (!param) {
                    paths.splice(i, 1);
                } else {
                    paths[i] = param;
                }
            } else {
                param = params[path];

                if (!param) {
                    console.error(`value for param ${path} not supplied`);
                }

                paths[i] = param;
            }
        }
    }

    return paths.join('/');
};

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

        window.addEventListener('resize', this.handleWindowResize);
    }

    componentDidMount() {
        this.computeMenuSize();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeCountry,
            activeProject,
            activeUser,
        } = nextProps;
        const navbarItems = this.createNavbarItems(activeProject);
        const dropdownItems = this.createDropdownItems(
            activeProject,
            activeUser,
            activeCountry,
        );
        this.setState({ navbarItems, dropdownItems });
    }

    componentDidUpdate() {
        this.computeMenuSize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    onSelectChangeHandler = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    getNavbarItem = (key, item) => {
        const params = {
            projectId: this.props.activeProject,
            analysisFrameworkId: 1,
        };

        return (
            <Link
                to={reverseRoute(pathNames[item], params)}
                className={styles['menu-item']}
                key={item}
            >
                { pageTitles[item] }
            </Link>
        );
    }

    getOverflowMenuItem = item => (
        <span
            className={styles['menu-item']}
            key={item}
        >
            { pageTitles[item] }
        </span>
    )

    computeMenuSize = () => {
        const menu = this.menu;

        if (menu) {
            const cr = menu.getBoundingClientRect();

            const links = menu.getElementsByTagName('a');
            const overflow = menu.getElementsByTagName('div')[0];

            const linkWidths = [];
            let totalWidth = 0;

            for (let i = 0; i < links.length; i += 1) {
                links[i].style.display = 'inline-flex';
                const width = links[i].getBoundingClientRect().width;
                linkWidths.push(width);
                totalWidth += width;
            }


            if (menu.scrollWidth > Math.ceil(cr.width)) {
                totalWidth += overflow.getBoundingClientRect().width;

                linkWidths.reverse();

                let lastVisibleLinkIndex = links.length - 1;
                while (totalWidth > cr.width) {
                    totalWidth -= linkWidths[0];
                    linkWidths.shift();

                    links[lastVisibleLinkIndex].style.display = 'none';
                    lastVisibleLinkIndex -= 1;
                    overflow.style.display = 'inline-flex';

                    if (lastVisibleLinkIndex === 0) {
                        break;
                    }
                }
            } else {
                overflow.style.display = 'none';

                for (let i = 0; i < links.length; i += 1) {
                    links[i].style.display = 'inline-flex';
                }
            }
        }
    }

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    labelSelectorForSelectInput = (option = {}) => (option.id)

    keySelectorForSelectInput = (option = {}) => (option.title)

    createNavbarItems = activeProject => [
        {
            linkTo: `/${activeProject}/leads/`,
            name: pageTitles.leads,
            needsProject: true,
            private: true,
        },
        {
            linkTo: `/${activeProject}/entries/`,
            name: pageTitles.entries,
            needsProject: true,
            private: true,
        },
        {
            linkTo: `/${activeProject}/ary/`,
            name: pageTitles.ary,
            needsProject: true,
            private: true,
        },
        {
            linkTo: '/weekly-snapshot/',
            name: pageTitles.weeklySnapshot,
            needsProject: true,
            private: true,
        },
        {
            linkTo: `/${activeProject}/export/`,
            name: pageTitles.export,
            needsProject: true,
            private: true,
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
                    private: true,
                },
                {
                    linkTo: `/countrypanel/${getValidLinkOrEmpty(activeCountry)}`,
                    name: pageTitles.countryPanel,
                    iconName: 'ion-android-globe',
                    private: true,
                },
                {
                    linkTo: `/${activeProject}/projectpanel/`,
                    name: pageTitles.projectPanel,
                    iconName: 'ion-wrench',
                    needsProject: true,
                    private: true,
                },
                {
                    linkTo: '/analysis-framework/',
                    name: pageTitles.analysisFramework,
                    iconName: 'ion-android-apps',
                    private: true,
                },
                {
                    linkTo: '/category-editor/',
                    name: pageTitles.categoryEditor,
                    iconName: 'ion-document-text',
                    private: true,
                },
                {
                    linkTo: '/admin/',
                    name: pageTitles.adminPanel,
                    iconName: 'ion-locked',
                    private: true,
                },
            ],
        },
    ]
    calcNavbarKey = item => item.name

    calcDropdownGroupKey = group => group.key

    calcDropdownItemKey = item => item.name


    handleWindowResize = () => {
        this.computeMenuSize();
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
            activeUser,
        } = this.props;
        if (navbarValidLinks.indexOf(item.name) === -1) {
            return null;
        }
        if (item.needsProject && userProjects.length <= 0) {
            return null;
        }
        if (item.private && !activeUser.userId) {
            console.warn('here');
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
        const links = [
            'projects',
            'countries',
            'leads',
            'entries',
            'ary',
            'analysisFramework',
        ];

        const {
            activeProject,
            activeUser,
            navbarVisible,
            userProjects,
            userInformation,
        } = this.props;

        if (!navbarVisible) {
            return null;
        }

        return (
            <nav
                styleName="navbar"
            >
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
                {
                    userProjects.length > 0 && activeUser.userId && (
                        <SelectInput
                            clearable={false}
                            keySelector={this.labelSelectorForSelectInput}
                            labelSelector={this.keySelectorForSelectInput}
                            onChange={this.onSelectChangeHandler}
                            options={this.props.userProjects}
                            placeholder="Select Event"
                            showHintAndError={false}
                            showLabel={false}
                            styleName="project-select-input"
                            value={activeProject}
                        />
                    )
                }

                <div
                    ref={(el) => { this.menu = el; }}
                    styleName="menu-items"
                >
                    <List
                        data={links}
                        keyExtractor={this.calcNavbarKey}
                        modifier={this.getNavbarItem}
                    />
                    <div
                        styleName="overflow-menu"
                    >
                        <button
                            styleName="overflow-button"
                        >
                            <span className="ion-android-more-horizontal" />
                        </button>
                        <div
                            styleName="overflow-items"
                        >
                            <div>Hello</div>
                        </div>
                    </div>
                </div>

                <DropdownMenu
                    styleName="dropdown-menu"
                    className="dropdown-title"
                    iconLeft="ion-android-person"
                    title={userInformation.displayName || activeUser.displayName || 'Anon'}
                >
                    <List
                        data={this.state.dropdownItems}
                        keyExtractor={this.calcDropdownGroupKey}
                        modifier={this.renderDropdownGroup}
                    />
                    {
                        activeUser.userId &&
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
                    }
                </DropdownMenu>
            </nav>
        );
    }
}
