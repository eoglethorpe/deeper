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
    editMode: PropTypes.bool,
    initialValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    ceStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    editMode: false,
    initialValue: {},
};

const mapStateToProps = state => ({
    ceStrings: ceStringsSelector(state),
});

@connect(mapStateToProps)
export default class NewCategoryModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            titleValue: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { title: titleValue = '' } = props.initialValue || {};
        this.state = {
            schema: NewCategoryModal.schema,
            formErrors: {},
            formFieldErrors: {},
            formValues: { titleValue },
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

    successCallback = ({ titleValue }) => {
        this.props.onSubmit(titleValue);
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const { editMode } = this.props;
        const {
            formErrors,
            formFieldErrors,
            formValues,
            schema,
            pristine,
        } = this.state;

        const title = editMode
            ? this.props.ceStrings('editCategoryTooltip')
            : this.props.ceStrings('addCategoryTooltip');

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
                    title={title}
                />
                <ModalBody key="body">
                    <TextInput
                        formname="titleValue"
                        label={this.props.ceStrings('addCategoryTitleLabel')}
                        placeholder={this.props.ceStrings('addCategoryTitlePlaceholder')}
                        autoFocus
                    />
                </ModalBody>
                <ModalFooter key="footer">
                    <Button onClick={this.handleModalClose} >
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
