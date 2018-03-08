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

    const schema = {
        fields: {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
        },
    };

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <Form
                elements={elements}
                schema={schema}
                changeCallback={() => {}}
                failureCallback={() => {}}
                successCallback={() => {}}
            >
                <TextInput />
            </Form>
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
