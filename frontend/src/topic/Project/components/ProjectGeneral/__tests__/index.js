import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ProjectGeneral from '../index';

const initialState = {
};

describe('<ProjectGeneral />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <ProjectGeneral
                onChange={() => {}}
                onFailure={() => {}}
                onSuccess={() => {}}
                pending
                stale={false}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
