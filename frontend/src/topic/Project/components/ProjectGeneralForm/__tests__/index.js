import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ProjectGeneralForm from '../index';

const initialState = {
};

describe('<ProjectGeneralForm />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);

    const wrapper = shallow(
        <Provider
            store={store}
        >
            <ProjectGeneralForm
                changeCallback={() => {}}
                failureCallback={() => {}}
                successCallback={() => {}}
                handleFormCancel={() => {}}
                formErrors={[]}
                formFieldErrors={{}}
                formValues={{}}
                userGroupsOptions={[]}
                regionOptions={[]}
                pending
                pristine={false}
            />
        </Provider>,
    );

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });
});
