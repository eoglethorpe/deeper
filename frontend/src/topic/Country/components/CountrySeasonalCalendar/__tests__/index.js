import React from 'react';
import { shallow } from 'enzyme';
import CountrySeasonalCalendar from '../';

describe('<CountrySeasonalCalendar />', () => {
    const wrapper = shallow(
        <CountrySeasonalCalendar
            countryId={12}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
