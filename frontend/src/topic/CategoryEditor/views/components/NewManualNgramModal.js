import React from 'react';
import PropTypes from 'prop-types';

import {
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../public/components/View';
import {
    Button,
    PrimaryButton,
} from '../../../../public/components/Action';
import { TextInput } from '../../../../public/components/Input';

import styles from '../styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
};

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
                title="Add new word"
            />,
            <ModalBody key="body">
                <TextInput
                    label="Word"
                    placeholder="Wash your hand"
                    onChange={this.handleWordValueChange}
                    value={this.state.wordValue}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button onClick={this.handleModalClose}>
                    Cancel
                </Button>
                <PrimaryButton
                    onClick={this.handleModalOk}
                    className={styles['ok-button']}
                >
                    Ok
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}

