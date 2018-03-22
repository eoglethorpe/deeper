import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

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
