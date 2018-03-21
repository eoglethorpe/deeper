import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    NavLink,
} from 'react-router-dom';

import { reverseRoute } from '../../vendor/react-store/utils/common';
import List from '../../vendor/react-store/components/View/List';
import DropdownMenu from '../../vendor/react-store/components/Action/DropdownMenu';

import {
    iconNames,
    pathNames,
} from '../../constants';
import {
    pageTitleStringsSelector,
} from '../../redux';

import Cloak from '../Cloak';
import styles from './styles.scss';

const propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.object,
    ),
    projectId: PropTypes.number,
    countryId: PropTypes.number,
    className: PropTypes.string,
    pageTitleStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    countryId: undefined,
    links: [],
};

const mapStateToProps = state => ({
    pageTitleStrings: pageTitleStringsSelector(state),
});

@withRouter
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class NavMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const overflowMenuLinks = [];

        this.state = {
            navLinks: props.links,
            overflowMenuLinks,
        };
    }

    componentWillMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentDidMount() {
        this.computeSize();
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            { navLinks: nextProps.links },
            () => {
                this.computeSize();
            },
        );
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    getNavItem = (key, item, className) => {
        const {
            projectId,
            countryId,
        } = this.props;

        const params = {
            projectId,
            countryId,
        };

        return (
            <Cloak
                key={key}
                requireLogin={item.requireLogin}
                requireProject={item.requireProject}
                requireAdminRights={item.requireAdminRights}
                requireDevMode={item.requireDevMode}
                render={
                    () => (
                        <NavLink
                            activeClassName={styles.active}
                            to={reverseRoute(pathNames[key], params)}
                            className={className}
                            exact
                        >
                            { this.props.pageTitleStrings(key) }
                        </NavLink>
                    )
                }
            />
        );
    }

    getNavbarItem = (key, item) => (
        this.getNavItem(key, item, styles['menu-item'])
    )

    getOverflowMenuItem = (key, item) => (
        this.getNavItem(key, item, styles['overflow-menu-item'])
    )

    computeSize = () => {
        const menu = this.menu;
        const { navLinks } = this.state;

        const overflowMenuLinks = [];

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
                    overflowMenuLinks.unshift(navLinks[lastVisibleLinkIndex]);

                    totalWidth -= linkWidths[0];
                    linkWidths.shift();

                    links[lastVisibleLinkIndex].style.display = 'none';
                    overflow.style.display = 'inline-flex';
                    lastVisibleLinkIndex -= 1;

                    if (lastVisibleLinkIndex < 0) {
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

        this.setState({
            overflowMenuLinks,
        });
    }

    keyExtractor = d => d.key

    handleWindowResize = () => {
        this.computeSize();
    }

    render() {
        const { className } = this.props;

        const {
            navLinks,
            overflowMenuLinks,
        } = this.state;

        return (
            <div
                ref={(el) => { this.menu = el; }}
                className={`${styles.navMenu} ${className}`}
            >
                <List
                    data={navLinks}
                    modifier={this.getNavbarItem}
                    keyExtractor={this.keyExtractor}
                />

                <DropdownMenu
                    iconName={iconNames.overflowHorizontal}
                    className={styles.overflowMenu}
                    hideDropdownIcon
                    dropdownClassName={styles['navbar-overflow-dropdown']}
                >
                    <List
                        data={overflowMenuLinks}
                        modifier={this.getOverflowMenuItem}
                        keyExtractor={this.keyExtractor}
                    />
                </DropdownMenu>
            </div>
        );
    }
}
