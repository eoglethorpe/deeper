import React from 'react';
import { shallow } from 'enzyme';
import CountryPopulationData from '../';

describe('<CountryPopulationData />', () => {
    const wrapper = shallow(
        <CountryPopulationData
            iso=""
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
