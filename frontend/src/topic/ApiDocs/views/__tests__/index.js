import React from 'react';
import { shallow } from 'enzyme';
import ApiDocs from '../index';


describe('<ApiDocs />', () => {
    const wrapper = shallow(<ApiDocs />);
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
