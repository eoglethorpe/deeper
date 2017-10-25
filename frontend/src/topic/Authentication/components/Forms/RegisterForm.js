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
    formError: PropTypes.array, // eslint-disable-line
    formErrors: PropTypes.object.isRequired, // eslint-disable-line
    formValues: PropTypes.object.isRequired, // eslint-disable-line
    onSubmit: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
};

const defaultProps = {
    formError: [],
    formErrors: {},
    formValues: {},
};

@CSSModules(styles)
export default class RegisterForm extends React.PureComponent {
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            formErrors: nextProps.formErrors,
            formError: nextProps.formError,
        });
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
                <div styleName="non-field-errors">
                    {
                        (this.state.formError || []).map(err => (
                            <div
                                key={err}
                                styleName="error"
                            >
                                {err}
                            </div>
                        ))
                    }
                </div>
                <TextInput
                    label="First name"
                    placeholder="John"
                    ref={this.form.updateRef('firstname')}
                    initialValue={this.state.formValues.firstname}
                    error={this.state.formErrors.firstname}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Last name"
                    placeholder="Doe"
                    ref={this.form.updateRef('lastname')}
                    initialValue={this.state.formValues.lastname}
                    error={this.state.formErrors.lastname}
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
                <TextInput
                    label="Email"
                    placeholder="john.doe@mail.com"
                    ref={this.form.updateRef('email')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}
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
