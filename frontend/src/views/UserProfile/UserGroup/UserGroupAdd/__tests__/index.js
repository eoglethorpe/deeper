import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserGroupAdd from '../index';
import Form from '../../../../../vendor/react-store/components/Input/Form';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';

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
    const schema = {};
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserGroupAdd>
                <Form
                    schema={schema}
                    changeCallback={changeCallback}
                    failureCallback={failureCallback}
                    successCallback={successCallback}
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
