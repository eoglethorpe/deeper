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

import {
    ceStrings,
} from '../../../../common/constants';

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
                title={ceStrings.addNewSubCategoryModalTitle}
            />,
            <ModalBody key="body">
                <TextInput
                    label={ceStrings.addSubCategoryTitleLabel}
                    placeholder={ceStrings.addSubCategoryTitlePlaceholder}
                    onChange={this.handleTitleValueChange}
                    value={this.state.titleValue}
                    autoFocus
                />
                <TextInput
                    label={ceStrings.addSubCategoryDescriptionLabel}
                    placeholder={ceStrings.addSubCategoryDescriptionPlaceholder}
                    onChange={this.handleDescriptionValueChange}
                    value={this.state.descriptionValue}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button onClick={this.handleModalClose}>
                    {ceStrings.modalCancel}
                </Button>
                <PrimaryButton
                    onClick={this.handleModalOk}
                    className={styles['ok-button']}
                >
                    {ceStrings.modalOk}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
