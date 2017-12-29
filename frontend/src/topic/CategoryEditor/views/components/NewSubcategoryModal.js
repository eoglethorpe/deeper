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

export default class NewSubcategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            titleValue: '',
            descriptionValue: '',
        };
    }

    handleTitleValueChange = (value) => {
        this.setState({
            titleValue: value,
        });
    }

    handleDescriptionValueChange = (value) => {
        this.setState({
            descriptionValue: value,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    handleModalOk = () => {
        const { titleValue, descriptionValue } = this.state;
        this.props.onSubmit({
            title: titleValue,
            description: descriptionValue,
        });
    }

    render() {
        return ([
            <ModalHeader
                key="header"
                title="Add new subcategory"
            />,
            <ModalBody key="body">
                <TextInput
                    label="Title"
                    placeholder="Wash"
                    onChange={this.handleTitleValueChange}
                    value={this.state.titleValue}
                />
                <TextInput
                    label="Description"
                    placeholder="Wash your own plates"
                    onChange={this.handleDescriptionValueChange}
                    value={this.state.descriptionValue}
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
