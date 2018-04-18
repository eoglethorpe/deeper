import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserProjectAdd from '../index';

const initialState = {
};


describe('<UserProjectAdd />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserProjectAdd />
        </Provider>,
    );

    it('renders properly along with form', () => {
        expect(wrapper.length).toEqual(1);
    });
});
