import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserGroupAdd from '../index';
import {
    Form,
    TextInput,
} from '../../../../../public/components/Input';

const initialState = {
};


describe('<UserGroupAdd />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const changeCallback = () => {
    };
    const failureCallback = () => {
    };
    const successCallback = () => {
    };
    const validations = {};
    const elements = [];
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserGroupAdd>
                <Form
                    changeCallback={changeCallback}
                    elements={elements}
                    failureCallback={failureCallback}
                    successCallback={successCallback}
                    validations={validations}
                >
                    <TextInput />
                </Form>
            </UserGroupAdd>
        </Provider>,
    );

    it('renders properly along with form', () => {
        expect(wrapper.length).toEqual(1);
    });
});
