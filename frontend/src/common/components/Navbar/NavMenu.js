import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    withRouter,
    NavLink,
} from 'react-router-dom';

import {
    reverseRoute,
} from '../../../public/utils/common';

import { List } from '../../../public/components/View';
import styles from './styles.scss';

import {
    DropdownMenu,
} from '../../../public/components/Action';

import {
    iconNames,
    pageTitles,
    pathNames,
} from '../../constants';

const propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.string,
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
        this.setState({
            navLinks: nextProps.links,
        }, () => { this.computeSize(); });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    getNavItem = (item, className) => {
        const {
            projectId,
            countryId,
        } = this.props;

        const params = {
            projectId,
            countryId,
            analysisFrameworkId: 1,
        };

        return (
            <NavLink
                activeClassName={styles.active}
                to={reverseRoute(pathNames[item], params)}
                className={className}
                key={item}
                exact
            >
                { pageTitles[item] }
            </NavLink>
        );
    }

    getNavbarItem = (key, item) => (
        this.getNavItem(item, styles['menu-item'])
    )

    getOverflowMenuItem = (key, item) => (
        this.getNavItem(item, styles['overflow-menu-item'])
    )

    computeSize = () => {
        const menu = this.menu;
        const {
            navLinks,
        } = this.state;

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

    keyExtractor = d => d

    handleWindowResize = () => {
        this.computeSize();
    }

    render() {
        const {
            className,
        } = this.props;

        const {
            navLinks,
            overflowMenuLinks,
        } = this.state;

        return (
            <div
                ref={(el) => { this.menu = el; }}
                styleName="nav-menu"
                className={className}
            >
                <List
                    data={navLinks}
                    modifier={this.getNavbarItem}
                    keyExtractor={this.keyExtractor}
                />

                <DropdownMenu
                    iconName={iconNames.overflowHorizontal}
                    styleName="overflow-menu"
                    hideDropdownIcon
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
