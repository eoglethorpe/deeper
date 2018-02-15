import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import React from 'react';
import { shallow } from 'enzyme';

import CountryGeneral from '../';

const initialState = {
};

describe('<CountryGeneral />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider store={store}>
            <CountryGeneral
                countryId={12}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
