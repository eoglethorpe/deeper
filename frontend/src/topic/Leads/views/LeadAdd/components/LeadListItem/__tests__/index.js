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
                choice="error"
                leadKey="key"
                lead={{ data: { type: 'dropbox' }, form: { values: {} } }}
                leadState="uploading"
                upload={{ progress: 10 }}
                onClick={() => console.warn('lead list is clicked')}
                onRemove={() => console.warn('lead list is removed')}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
