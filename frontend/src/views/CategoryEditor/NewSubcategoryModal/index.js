import React from 'react';
import PropTypes from 'prop-types';

import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Faram, { requiredCondition } from '../../../vendor/react-store/components/Input/Faram';

import _ts from '../../../ts';

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

    static schema = {
        fields: {
            title: [requiredCondition],
            description: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            schema: NewSubcategoryModal.schema,
            faramErrors: {},
            faramValues: {},
            pristine: true,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = ({ title, description }) => {
        this.props.onSubmit({
            title,
            description,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

        return (
            <Faram
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
            >
                <ModalHeader
                    key="header"
                    title={_ts('ce', 'addNewSubCategoryModalTitle')}
                />
                <ModalBody key="body">
                    <TextInput
                        faramElementName="title"
                        label={_ts('ce', 'addSubCategoryTitleLabel')}
                        placeholder={_ts('ce', 'addSubCategoryTitlePlaceholder')}
                        autoFocus
                    />
                    <TextInput
                        faramElementName="description"
                        label={_ts('ce', 'addSubCategoryDescriptionLabel')}
                        placeholder={_ts('ce', 'addSubCategoryDescriptionPlaceholder')}
                    />
                </ModalBody>
                <ModalFooter key="footer">
                    <Button onClick={this.handleModalClose}>
                        {_ts('ce', 'modalCancel')}
                    </Button>
                    <PrimaryButton
                        className={styles.okButton}
                        disabled={pristine}
                        type="submit"
                    >
                        {_ts('ce', 'modalOk')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        );
    }
}
