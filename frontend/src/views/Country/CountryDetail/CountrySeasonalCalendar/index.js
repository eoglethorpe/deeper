import PropTypes from 'prop-types';
import React from 'react';

import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

export default class CountrySeasonalCalendar extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;

        const seasonalCalendarText = _ts('countries', 'seasonalTabLabel');
        const underConstructionText = _ts('common', 'underConstructionLabel');

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
