import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    PrimaryButton,
    DangerButton,
} from '../../../../public/components/Button';
// import { ImageInput } from '../../../../public/components/FileInput';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
} from '../../../../public/utils/Form';

const propTypes = {
    formError: PropTypes.array, // eslint-disable-line
    formErrors: PropTypes.object.isRequired, // eslint-disable-line
    formValues: PropTypes.object, //eslint-disable-line
    onSubmit: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
};
const defaultProps = {
    formError: [],
    formErrors: {},
    formValues: {},
    pending: false,
};


@CSSModules(styles)
export default class UserProfileEditForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const changeCallback = (values, { error, errors }) => {
            this.setState({
                formValues: { ...this.state.formValues, ...values },
                formErrors: { ...this.state.formErrors, ...errors },
                formError: error,
            });
        };

        const failureCallback = ({ error, errors }) => {
            this.setState({
                formErrors: { ...this.state.formErrors, ...errors },
                formError: error,
            });
        };

        const successCallback = (values) => {
            this.props.onSubmit(values);
        };

        const form = new Form();
        const elements = ['firstName', 'lastName', 'organization'];
        const validations = {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
        };

        form.setElements(elements);
        form.setValidations(validations);
        form.setCallbacks({
            changeCallback,
            successCallback,
            failureCallback,
        });

        this.form = form;

        this.state = {
            formError: this.props.formError,
            formErrors: this.props.formErrors,
            formValues: this.props.formValues,
        };
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

    handleFormCancel = (e) => {
        e.preventDefault();
        this.props.onCancel();
    }

    render() {
        const {
            pending,
        } = this.props;

        return (
            <form
                styleName="user-profile-edit-form"
                onSubmit={this.handleSubmit}
            >
                {
                    pending &&
                    <div styleName="pending-overlay">
                        <i
                            className="ion-load-c"
                            styleName="loading-icon"
                        />
                    </div>
                }
                {/*
                <ImageInput
                    showPreview
                    styleName="display-picture"
                />
                */}
                <TextInput
                    label="First name"
                    placeholder="John"

                    ref={this.form.updateRef('firstName')}
                    initialValue={this.state.formValues.firstName}
                    error={this.state.formErrors.firstName}

                    onChange={this.onChange}
                />
                <TextInput
                    label="Last name"
                    placeholder="Doe"

                    ref={this.form.updateRef('lastName')}
                    initialValue={this.state.formValues.lastName}
                    error={this.state.formErrors.lastName}

                    onChange={this.onChange}
                />
                <TextInput
                    label="Organization"
                    placeholder="Togglecorp"

                    ref={this.form.updateRef('organization')}
                    initialValue={this.state.formValues.organization}
                    error={this.state.formErrors.organization}

                    onChange={this.onChange}
                />

                <div styleName="action-buttons">
                    <DangerButton onClick={this.handleFormCancel}>
                        Cancel
                    </DangerButton>
                    <PrimaryButton>
                        Save changes
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
