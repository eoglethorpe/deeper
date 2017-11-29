import React from 'react';
import { shallow } from 'enzyme';
import LeadColumnHeader from '../';

describe('<LeadColumnHeader />', () => {
    const wrapper = shallow(
        <LeadColumnHeader
            label={'Title'}
            sortOrder={'asc'}
            sortable
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
