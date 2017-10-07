import React from 'react';
import { shallow } from 'enzyme';
import Leads from '../';

describe('<Leads />', () => {
    const wrapper = shallow(
        <Leads
            pending={false}
            onSubmit={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
