import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountrySeasonalCalendar extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        return (
            <div>
                Seasonal Calendar {countryId}
            </div>
        );
    }
}
