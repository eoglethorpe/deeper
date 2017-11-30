import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import AddLeadListItem from '../';


const initialState = {
};

describe('<AddLeadListItem />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <AddLeadListItem
                active
                onClick={() => {}}
                stale={false}
                error={false}
                title={'Lead #1'}
                type={'URL'}
                lead={{ dummy: 'dummy' }}
                leadKey="key"
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
