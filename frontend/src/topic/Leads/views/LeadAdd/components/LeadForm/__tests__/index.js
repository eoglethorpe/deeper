import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import AddLeadForm from '../';

const initialState = {
};

describe('<AddLeadForm />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <AddLeadForm
                leadOptions={{ dummy: 'dummy' }}
                lead={{ dummy: 'dummy' }}
                onSuccess={() => {}}
                onChange={() => {}}
                onFailure={() => {}}
                onExtractClick={() => {}}
                isSaveDisabled
                isExtractionDisabled
                isFormDisabled
                isExtractionLoading={false}
                isFormLoading={false}
                isBulkActionDisabled
                onApplyAllClick={() => {}}
                onApplyAllBelowClick={() => {}}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
