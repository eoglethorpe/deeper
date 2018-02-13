import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import UserProfile from '../';
import Form, { requiredCondition } from '../../../vendor/react-store/components/Input/Form';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';

const initialState = {
};

describe('<UserProfile />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserProfile />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});

describe('<User Profile Edit Form />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const elements = [
        'firstName',
        'lastName',
        'organization',
    ];

    const validation = {};
    const validations = {
        firstName: [requiredCondition],
        lastName: [requiredCondition],
        organization: [requiredCondition],
    };

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <Form
                changeCallback={() => {}}
                elements={elements}
                failureCallback={() => {}}
                successCallback={() => {}}
                validation={validation}
                validations={validations}
            >
                <TextInput />
            </Form>
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
