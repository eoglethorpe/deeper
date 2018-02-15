import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserProject from '../index';
import Modal from '../../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../../vendor/react-store/components/View/Modal/Header';
import Table from '../../../../vendor/react-store/components/View/Table';

const initialState = {
};

describe('<UserProject />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const data = [];
    const headers = [];
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserProject>
                <Table
                    data={data}
                    headers={headers}
                    keyExtractor={() => {}}
                />
                <Modal
                    closeOnEscape
                    onClose={() => {}}
                >
                    <ModalHeader
                        title="Header"
                    />
                    <ModalBody />
                </Modal>
            </UserProject>
        </Provider>,
    );

    it('renders properly with Table and Modal', () => {
        expect(wrapper.length).toEqual(1);
    });
});
