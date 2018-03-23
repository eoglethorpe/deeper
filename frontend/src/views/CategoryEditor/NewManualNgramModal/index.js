import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';

import { ceStringsSelector } from '../../../redux';

import styles from '../styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    ceStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    ceStrings: ceStringsSelector(state),
});

@connect(mapStateToProps)
export default class NewManualNgramModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            titleValue: '',
        };
    }

    handleWordValueChange = (value) => {
        this.setState({
            wordValue: value,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    handleModalOk = () => {
        this.props.onSubmit(this.state.wordValue);
    }

    render() {
        return ([
            <ModalHeader
                key="header"
                title={this.props.ceStrings('addNewWordModalTitle')}
            />,
            <ModalBody key="body">
                <TextInput
                    label={this.props.ceStrings('addNewWordLabel')}
                    placeholder={this.props.ceStrings('addNewWordPlaceholder')}
                    onChange={this.handleWordValueChange}
                    value={this.state.wordValue}
                    autoFocus
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button onClick={this.handleModalClose}>
                    {this.props.ceStrings('modalCancel')}
                </Button>
                <PrimaryButton
                    onClick={this.handleModalOk}
                    className={styles.okButton}
                >
                    {this.props.ceStrings('modalOk')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
