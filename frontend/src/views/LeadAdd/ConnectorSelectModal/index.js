import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    leadsStringsSelector,
} from '../../../redux';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    leadsStrings: leadsStringsSelector(state),
});

@connect(mapStateToProps, null)
export default class ConnectorSelectModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            dummy: 'dummy',
        };
    }

    render() {
        const {
            leadsStrings,
        } = this.props;

        return (
            <Modal>
                <ModalHeader
                    title={leadsStrings('connectorsLabel')}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleAddConnectorModalClose}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </PrimaryButton>
                    }
                />
                <ModalBody>
                    This is a modal.
                </ModalBody>
            </Modal>
        );
    }
}
