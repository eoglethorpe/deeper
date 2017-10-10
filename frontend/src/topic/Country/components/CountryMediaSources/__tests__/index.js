import React from 'react';
import { shallow } from 'enzyme';
import CountryMediaSources from '../';

describe('<CountryMediaSources />', () => {
    const wrapper = shallow(
        <CountryMediaSources
            countryId=""
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
