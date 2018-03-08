import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserProjectAdd from '../index';
import Form from '../../../vendor/react-store/components/Input/Form';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';

const initialState = {
};


describe('<UserProjectAdd />', () => {
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
            <UserProjectAdd>
                <Form
                    changeCallback={changeCallback}
                    schema={schema}
                    failureCallback={failureCallback}
                    successCallback={successCallback}
                >
                    <TextInput />
                </Form>
            </UserProjectAdd>
        </Provider>,
    );

    it('renders properly along with form', () => {
        expect(wrapper.length).toEqual(1);
    });
});
