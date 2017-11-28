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
import { isTruthy } from '../../../public/utils/common';


import LinkOutsideRouter from '../LinkOutsideRouter';
import { pageTitles } from '../../utils/labels';
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

    onSelectChangeHandler = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
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

    renderNavbarItem = (key, item) => {
        const {
            navbarActiveLink,
            navbarValidLinks,
            userProjects,
            activeUser,
        } = this.props;
        if (navbarValidLinks.indexOf(item.name) <= -1) {
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
        console.log('Rendering Navbar');
        const {
            activeProject,
            activeUser,
            userInformation,
            navbarVisible,
            userProjects,
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
                {
                    userProjects.length > 0 && activeUser.userId &&
                    <SelectInput
                        styleName="project-select-input"
                        placeholder="Select Event"
                        keySelector={this.labelSelectorForSelectInput}
                        labelSelector={this.keySelectorForSelectInput}
                        options={this.props.userProjects}
                        value={activeProject}
                        onChange={this.onSelectChangeHandler}
                        clearable={false}
                    />
                }
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
                    title={userInformation.displayName || activeUser.displayName || 'Anon'}
                >
                    <List
                        data={dropdownItems}
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
            </div>
        );
    }
}
