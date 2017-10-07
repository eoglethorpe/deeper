import React from 'react';
import { shallow } from 'enzyme';
import CountryDetail from '../';

describe('<CountryDetail />', () => {
    const wrapper = shallow(
        <CountryDetail
            fullName="Country name"
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
