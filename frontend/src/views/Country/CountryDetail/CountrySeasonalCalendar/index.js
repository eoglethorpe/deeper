import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

export default class CountrySeasonalCalendar extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;

        const seasonalCalendarText = 'Seasonal calendar';
        const underConstructionText = 'Under construction';

        return (
            <div className={styles.seasonalCalendar}>
                <div>
                    {seasonalCalendarText} #{countryId}
                </div>
                <div className={styles.underConstruction}>
                    {underConstructionText}
                </div>
            </div>
        );
    }
}
