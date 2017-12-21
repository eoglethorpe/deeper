import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import CountryDetail from '../';

jest.mock('mapbox-gl', () => undefined);

const initialState = {
};

describe('<CountryDetail />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider store={store}>
            <CountryDetail />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
