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
export default class LoginForm extends React.PureComponent {
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
        const elements = ['email', 'password'];
        const validations = {
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
        /*
        // This is an example
        form.setValidation('email', 'password', (email, password) => {
            if (email.length < password.length) {
                return {
                    ok: false,
                    message: ['Email must be longer than password'],
                };
            }
            return { ok: true };
        });
        */
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
            <form styleName="login-form" onSubmit={this.handleSubmit}>
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
                    label="Email"
                    placeholder="john.doe@mail.com"

                    ref={this.form.updateRef('email')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}

                    onChange={this.onChange}
                />
                <TextInput
                    label="Password"
                    type="password"
                    required

                    ref={this.form.updateRef('password')}
                    initialValue={this.state.formValues.password}
                    error={this.state.formErrors.password}

                    onChange={this.onChange}
                />
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Login
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
