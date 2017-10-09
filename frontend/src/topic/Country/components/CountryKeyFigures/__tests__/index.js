import React from 'react';
import { shallow } from 'enzyme';
import CountryGeneral from '../';

describe('<CountryGeneral />', () => {
    const wrapper = shallow(
        <CountryGeneral
            countryId=""
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
