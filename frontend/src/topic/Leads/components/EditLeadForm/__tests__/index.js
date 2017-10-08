import React from 'react';
import { shallow } from 'enzyme';
import EditLeadForm from '../';

describe('<EditLeadForm />', () => {
    const wrapper = shallow(
        <EditLeadForm
            pending={false}
            onSubmit={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
