import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ApiDocs from '../index';

const initialState = {
};


describe('<ApiDocs />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider store={store}>
            <ApiDocs />
        </Provider>,
    );
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
