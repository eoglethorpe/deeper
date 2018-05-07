import PropTypes from 'prop-types';
import React from 'react';
import {
    withRouter,
    NavLink,
} from 'react-router-dom';

import { reverseRoute } from '../../../vendor/react-store/utils/common';
import List from '../../../vendor/react-store/components/View/List';
import DropdownMenu from '../../../vendor/react-store/components/Action/DropdownMenu';

import {
    iconNames,
    pathNames,
} from '../../../constants';
import _ts from '../../../ts';

import Cloak from '../../Cloak';
import styles from './styles.scss';

const propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.object,
    ),
    projectId: PropTypes.number,
    countryId: PropTypes.number,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    countryId: undefined,
    links: [],
};

@withRouter
export default class NavMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = d => d.key

    static computeSize = (navLinks, menu) => {
        if (!menu) {
            return [];
        }

        const overflowMenuLinks = [];

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

        return overflowMenuLinks;
        /*
        this.setState({
            overflowMenuLinks,
        });
        */
    }

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

        const overflowMenuLinks = NavMenu.computeSize(this.state.navLinks, this.menu);
        this.setState({ overflowMenuLinks });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.links !== nextProps.links) {
            const overflowMenuLinks = NavMenu.computeSize(nextProps.links, this.menu);
            this.setState({
                navLinks: nextProps.links,
                overflowMenuLinks,
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    handleWindowResize = () => {
        const overflowMenuLinks = NavMenu.computeSize(this.state.navLinks, this.menu);
        this.setState({ overflowMenuLinks });
    }

    renderNavItem = (key, item, className) => {
        const {
            projectId,
            countryId,
        } = this.props;

        const route = reverseRoute(
            pathNames[key],
            { projectId, countryId },
        );

        return (
            <Cloak
                {...item}
                key={key}
                render={
                    () => (
                        <NavLink
                            activeClassName={styles.active}
                            to={route}
                            className={className}
                            exact
                        >
                            { _ts('pageTitle', key) }
                        </NavLink>
                    )
                }
            />
        );
    }

    renderNavbarItem = (key, item) => (
        this.renderNavItem(key, item, styles.menuItem)
    )

    renderOverflowMenuItem = (key, item) => (
        this.renderNavItem(key, item, styles.overflowMenuItem)
    )

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
                    modifier={this.renderNavbarItem}
                    keyExtractor={NavMenu.keyExtractor}
                />
                <DropdownMenu
                    iconName={iconNames.overflowHorizontal}
                    className={styles.overflowMenu}
                    dropdownClassName={styles.navbarOverflowDropdown}
                    hideDropdownIcon
                >
                    <List
                        data={overflowMenuLinks}
                        modifier={this.renderOverflowMenuItem}
                        keyExtractor={NavMenu.keyExtractor}
                    />
                </DropdownMenu>
            </div>
        );
    }
}
