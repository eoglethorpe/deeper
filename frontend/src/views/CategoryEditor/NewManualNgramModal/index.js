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

const defaultProps = { };

const mapStateToProps = state => ({
    ceStrings: ceStringsSelector(state),
});

@connect(mapStateToProps)
export default class NewManualNgramModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            wordValue: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            schema: NewManualNgramModal.schema,
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

    successCallback = ({ wordValue }) => {
        this.props.onSubmit(wordValue);
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
                    title={this.props.ceStrings('addNewWordModalTitle')}
                />
                <ModalBody key="body">
                    <TextInput
                        formname="wordValue"
                        label={this.props.ceStrings('addNewWordLabel')}
                        placeholder={this.props.ceStrings('addNewWordPlaceholder')}
                        autoFocus
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
