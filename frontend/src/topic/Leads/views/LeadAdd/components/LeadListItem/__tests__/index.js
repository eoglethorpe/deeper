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
                active={false}
                onClick={() => {}}
                lead={{ data: { type: 'dropbox' }, form: { values: {} } }}
                choice="error"
                leadKey="key"
                upload={{ progress: 1 }}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
