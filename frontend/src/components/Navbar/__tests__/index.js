import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import Navbar from '../';

const initialState = {
};

describe('<Navbar />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <Navbar
                logout={() => {}}
                setActiveProject={() => {}}
                stopTokenRefresh={() => {}}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
