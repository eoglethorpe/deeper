/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import React from 'react';
import { Link } from 'react-router-dom';

import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Form,
    NonFieldErrors,
    TextInput,
    emailCondition,
    requiredCondition,
} from '../../../../public/components/Input';
import { PrimaryButton } from '../../../../public/components/Action';
import {
    FgRestBuilder,
} from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';

import {
    pathNames,
} from '../../../../common/constants';
import schema from '../../../../common/schema';
import {
    transformResponseErrorToFormError,
    createParamsForUserPasswordReset,
    urlForUserPasswordReset,
} from '../../../../common/rest';

import logo from '../../../../img/deep-logo-white.png';

import styles from './styles.scss';

const propTypes = { };

const defaultProps = { };

@CSSModules(styles, { allowMultiple: true })
export default class PasswordReset extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
            resetSuccess: false,
        };

        // Data for form elements
        this.elements = ['email'];
        this.validations = {
            email: [
                requiredCondition,
                emailCondition,
            ],
        };
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = ({ email }) => {
        const url = urlForUserPasswordReset;
        const params = createParamsForUserPasswordReset({ email });
        this.passwordReset({ url, params });
    };

    // LOGIN ACTION

    passwordReset = ({ url, params }) => {
        // Stop any retry action
        if (this.userPasswordRestRequest) {
            this.userPasswordRestRequest.stop();
        }
        this.userPasswordRestRequest = this.createRequestPasswordReset(url, params);

        this.userPasswordRestRequest.start();
    };

    // LOGIN REST API

    createRequestPasswordReset = (url, params) => {
        const userPasswordRestRequest = new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => {
                this.setState({ pending: true, pristine: false });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPasswordResetResponse');
                    this.setState({ resetSuccess: true });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to reset password.'],
                });
            })
            .build();
        return userPasswordRestRequest;
    }

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            pristine,
            resetSuccess,
        } = this.state;

        return (
            <div styleName="reset-password">
                <div styleName="deep-container">
                    <img
                        styleName="logo"
                        src={logo}
                        alt="DEEP"
                        draggable="false"
                    />
                    <h2 styleName="heading">Data entry and exploration platform</h2>
                </div>
                <div styleName="left-box">
                    {
                        resetSuccess ?
                            <div styleName="info">
                                <p> Check your inbox: {formValues.email || 'john.doe@mail.com'} </p>
                            </div>
                            :
                            <Form
                                styleName="reset-password-form"
                                changeCallback={this.changeCallback}
                                elements={this.elements}
                                failureCallback={this.failureCallback}
                                successCallback={this.successCallback}
                                validation={this.validation}
                                validations={this.validations}
                            >
                                { pending && <LoadingAnimation /> }
                                <NonFieldErrors errors={formErrors} />
                                <TextInput
                                    disabled={pending}
                                    error={formFieldErrors.email}
                                    formname="email"
                                    value={formValues.email}
                                    label="Email"
                                    placeholder="john.doe@mail.com"
                                />
                                <div styleName="action-buttons">
                                    <PrimaryButton
                                        disabled={pending}
                                    >
                                        { pristine ? 'Reset Password*' : 'Reset Password' }
                                    </PrimaryButton>
                                </div>
                            </Form>
                    }
                    <div styleName="go-back-container">
                        <Link
                            styleName="go-back-link"
                            to={reverseRoute(pathNames.login, {})}
                        >
                            Go back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
