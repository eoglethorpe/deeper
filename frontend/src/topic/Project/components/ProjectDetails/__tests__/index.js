import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ProjectDetails from '../index';

jest.mock('mapbox-gl', () => undefined);

const initialState = {
};

describe('<ProjectDetails />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <ProjectDetails />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
