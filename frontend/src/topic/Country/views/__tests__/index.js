import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import CountryPanel from '../index';

jest.mock('mapbox-gl', () => undefined);

const initialState = {
};

describe('<CountryPanel />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <CountryPanel />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
