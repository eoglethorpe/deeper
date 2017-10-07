import React from 'react';
import { shallow } from 'enzyme';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';

describe('<LoginForm />', () => {
    const wrapper = shallow(
        <LoginForm
            pending={false}
            onSubmit={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('<RegisterForm />', () => {
    const wrapper = shallow(
        <RegisterForm
            pending={false}
            onSubmit={() => {}}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
