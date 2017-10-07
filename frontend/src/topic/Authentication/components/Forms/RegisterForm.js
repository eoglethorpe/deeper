import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/utils/Form';

const propTypes = {
    formErrors: PropTypes.object.isRequired, // eslint-disable-line
    formValues: PropTypes.object.isRequired, // eslint-disable-line
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    formErrors: {},
    formValues: {},
};

@CSSModules(styles)
export default class RegisterForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const form = new Form();
        const elements = ['firstname', 'lastname', 'organization', 'email', 'password'];
        const validations = {
            firstname: [
                requiredCondition,
            ],
            lastname: [
                requiredCondition,
            ],
            organization: [
                requiredCondition,
            ],
            email: [
                requiredCondition,
                emailCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
            ],
        };

        const updateValues = (data) => {
            this.setState({
                formValues: { ...this.state.formValues, ...data },
            });
        };

        const updateErrors = (data) => {
            this.setState({
                formErrors: data,
            });
        };

        const okay = (data) => {
            this.props.onRegister(data);
        };

        form.setElements(elements);
        form.setValidations(validations);

        // calls with new errors
        form.setCallbackForFocus(updateErrors);
        // new state
        form.setCallbackForChange(updateValues);
        // calls with success and error
        form.setCallbackForSuccessAndFailure(okay, updateErrors);

        this.form = form;

        this.state = {
            formValues: this.props.formValues,
            formErrors: this.props.formErrors,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.formErrors !== nextProps.formErrors) {
            this.setState({ formErrors: nextProps.formErrors });
        }
    }

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
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

    render() {
        const { pending } = this.props;

        return (
            <form styleName="register-form" onSubmit={this.handleSubmit}>
                {
                    pending && (
                        <div styleName="pending-overlay">
                            <i className="ion-load-c" styleName="loading-icon" />
                        </div>
                    )
                }
                <TextInput
                    label="First name"
                    placeholder="John"
                    ref={this.form.updateRef('firstname')}
                    initialValue={this.state.formValues.firstname}
                    error={this.state.formErrors.firstname}
                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Last name"
                    placeholder="Doe"
                    ref={this.form.updateRef('lastname')}
                    initialValue={this.state.formValues.lastname}
                    error={this.state.formErrors.lastname}
                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Organization"
                    placeholder="Togglecorp"
                    ref={this.form.updateRef('organization')}
                    initialValue={this.state.formValues.organization}
                    error={this.state.formErrors.organization}
                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Email"
                    placeholder="john.doe@mail.com"
                    ref={this.form.updateRef('email')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}
                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Password"
                    hint="Password should be more than four characters long."
                    type="password"
                    required

                    ref={this.form.updateRef('password')}
                    initialValue={this.state.formValues.password}
                    error={this.state.formErrors.password}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <div styleName="action-buttons">
                    <PrimaryButton
                        disabled={pending}
                    >
                        Register
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
