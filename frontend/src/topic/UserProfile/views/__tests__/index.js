import React from 'react';
import { shallow } from 'enzyme';
import UserProfile from '../';

describe('<UserProfile />', () => {
    const wrapper = shallow(
        <UserProfile />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
