import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../../../public/utils/Form';


@CSSModules(styles)
export default class LoginForm extends React.PureComponent {
    static propTypes = {
        onRegister: PropTypes.func.isRequired,
    };

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
            this.props.onRegister(
                data.firstname,
                data.lastname,
                data.organization,
                data.country,
                data.email,
                data.password,
            );
            console.log(data);
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
            formErrors: {},
            formValues: {},
        };
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
        return (
            <form styleName="register-form" onSubmit={this.handleSubmit}>
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
                    hint="Password should be at least four characters long"
                    type="password"
                    required

                    ref={this.form.updateRef('password')}
                    initialValue={this.state.formValues.password}
                    error={this.state.formErrors.password}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
