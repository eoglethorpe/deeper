import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Form, { requiredCondition } from '../../../vendor/react-store/components/Input/Form';

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
export default class NewSubcategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            titleValue: [requiredCondition],
            descriptionValue: [],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            schema: NewSubcategoryModal.schema,
            formErrors: {},
            formFieldErrors: {},
            formValues: {},
            pristine: false,
        };
    }

    changeCallback = (values, fieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formErrors,
            formFieldErrors: fieldErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({ formFieldErrors, formErrors });
    };

    successCallback = ({ titleValue, descriptionValue }) => {
        this.props.onSubmit({
            title: titleValue,
            description: descriptionValue,
        });
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,
            schema,
            pristine,
        } = this.state;

        return (
            <Form
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
            >
                <ModalHeader
                    key="header"
                    title={this.props.ceStrings('addNewSubCategoryModalTitle')}
                />
                <ModalBody key="body">
                    <TextInput
                        formname="titleValue"
                        label={this.props.ceStrings('addSubCategoryTitleLabel')}
                        placeholder={this.props.ceStrings('addSubCategoryTitlePlaceholder')}
                        autoFocus
                    />
                    <TextInput
                        formname="descriptionValue"
                        label={this.props.ceStrings('addSubCategoryDescriptionLabel')}
                        placeholder={this.props.ceStrings('addSubCategoryDescriptionPlaceholder')}
                    />
                </ModalBody>
                <ModalFooter key="footer">
                    <Button onClick={this.handleModalClose}>
                        {this.props.ceStrings('modalCancel')}
                    </Button>
                    <PrimaryButton
                        className={styles.okButton}
                        disabled={!pristine}
                        type="submit"
                    >
                        {this.props.ceStrings('modalOk')}
                    </PrimaryButton>
                </ModalFooter>
            </Form>
        );
    }
}
