import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
} from 'react-router-dom';


import { reverseRoute } from '../../../vendor/react-store/utils/common';
import List from '../../../vendor/react-store/components/View/List';
import DropdownMenu from '../../../vendor/react-store/components/Action/DropdownMenu';
import DropdownGroup from '../../../vendor/react-store/components/Action/DropdownMenu/Group';

import { stopSiloBackgroundTasksAction } from '../../../redux/middlewares/siloBackgroundTasks';
import { stopRefreshAction } from '../../../redux/middlewares/refresher';
import { adminEndpoint } from '../../../config/rest';
import {
    logoutAction,
    activeCountrySelector,
    activeProjectSelector,
    activeUserSelector,
    currentUserInformationSelector,

    commonStringsSelector,
    pageTitleStringsSelector,
} from '../../../redux';

import {
    iconNames,
    pathNames,
} from '../../../constants';

import Cloak from '../../Cloak';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeCountry: activeCountrySelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
    commonStrings: commonStringsSelector(state),
    pageTitleStrings: pageTitleStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    stopRefresh: () => dispatch(stopRefreshAction()),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
});

const propTypes = {
    className: PropTypes.string,
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    stopRefresh: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userInformation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    commonStrings: PropTypes.func.isRequired,
    pageTitleStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    activeProject: undefined,
    activeCountry: undefined,
    activeUser: {},
    userInformation: {},
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
export default class Navdrop extends React.PureComponent {
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

    handleLogoutButtonClick = () => {
        this.props.stopRefresh();
        this.props.stopSiloTasks();
        this.props.logout();
    }

    renderDropItem = (key, item) => {
        const {
            activeProject,
            activeCountry,
            activeUser = {},
            pageTitleStrings,
        } = this.props;

        const params = {
            projectId: activeProject,
            countryId: activeCountry,
            userId: activeUser.userId,
        };

        const iconName = Navdrop.dropdownItemIcons[key];

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
                        className={styles.dropdownItem}
                    >
                        { iconName && <span className={`${iconName} ${styles.icon}`} />}
                        { pageTitleStrings(key) }
                    </Link>
                )}
            />
        );
    }

    render() {
        const {
            activeUser,
            userInformation,
            commonStrings,
            pageTitleStrings,
            className,
            links,
            adminPanelLink,
        } = this.props;

        const userName = (
            userInformation.displayName ||
            activeUser.displayName ||
            commonStrings('anonymousLabel')
        );

        return (
            <DropdownMenu
                className={className}
                iconName={iconNames.person}
                title={userName}
            >
                <DropdownGroup>
                    <List
                        data={links}
                        keyExtractor={Navdrop.getDropItemKey}
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
                                    className={styles.dropdownItem}
                                    href={adminEndpoint}
                                    target="_blank"
                                >
                                    <span className={`${styles.icon} ${iconNames.locked}`} />
                                    {commonStrings('adminPanelLabel')}
                                </a>
                            )
                        }
                    />
                </DropdownGroup>
                <Link
                    target="_blank"
                    className={styles.dropdownItem}
                    to="https://chrome.google.com/webstore/detail/deep-2-add-lead/kafonkgglonkbldmcigbdojiadfcmcdc"
                >
                    <span className={`${styles.icon} ${iconNames.chrome}`} />
                    <span className={styles.label}>
                        { pageTitleStrings('browserExtension') }
                    </span>
                </Link>
                <Cloak
                    requireLogin
                    render={
                        () => (
                            <DropdownGroup>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={this.handleLogoutButtonClick}
                                >
                                    <span className={`${styles.icon} ${iconNames.logout}`} />
                                    {commonStrings('logoutLabel')}
                                </button>
                            </DropdownGroup>
                        )
                    }
                />
            </DropdownMenu>
        );
    }
}
