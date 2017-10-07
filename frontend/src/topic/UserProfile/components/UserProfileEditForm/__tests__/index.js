import React from 'react';
import { shallow } from 'enzyme';
import UserProfileEditForm from '../';

describe('<UserProfileEditForm />', () => {
    const wrapper = shallow(
        <UserProfileEditForm
            pending={false}
            onSubmit={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
