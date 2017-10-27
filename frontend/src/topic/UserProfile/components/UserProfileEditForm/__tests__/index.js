import React from 'react';
import { shallow } from 'enzyme';
import UserProfileEditForm from '../';

describe('<UserProfileEditForm />', () => {
    const formValues = {
        firstName: 'John',
        lastName: 'Doe',
        organization: 'Toggle',
    };

    const handleFormCancel = (e) => {
        e.preventDefault();
        this.props.onCancel();
    };

    const wrapper = shallow(
        <UserProfileEditForm
            pending={false}
            onSubmit={() => {}}
            onCancel={handleFormCancel}
            formValues={formValues}
        />,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
