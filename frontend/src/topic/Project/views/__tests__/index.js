import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ProjectPanel from '../index';

const initialState = {
};

describe('<ProjectPanel />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <ProjectPanel />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
