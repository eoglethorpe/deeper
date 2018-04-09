import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { reverseRoute } from '../../../vendor/react-store/utils/common';

import { pathNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    countryId: PropTypes.number.isRequired,
};

export default class CountryListItem extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { title, countryId } = this.props;

        const route = reverseRoute(pathNames.countries, { countryId });
        return (
            <NavLink
                activeClassName={styles.active}
                className={styles.countryLink}
                to={route}
                replace
            >
                {title}
            </NavLink>
        );
    }
}
