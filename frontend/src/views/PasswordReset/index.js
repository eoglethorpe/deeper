/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import ReCaptcha from '../../vendor/react-store/components/Input/ReCaptcha';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import Form, {
    requiredCondition,
    emailCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForUserPasswordReset,
    urlForUserPasswordReset,
} from '../../rest';
import { pathNames } from '../../constants';
import { loginStringsSelector } from '../../redux';
import { reCaptchaSiteKey } from '../../config/reCaptcha';
import schema from '../../schema';

import styles from './styles.scss';

const propTypes = {
    loginStrings: PropTypes.func.isRequired,
};

const defaultProps = { };

const mapStateToProps = state => ({
    loginStrings: loginStringsSelector(state),
});

@connect(mapStateToProps)
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
        this.elements = ['email', 'recaptchaResponse'];
        this.validations = {
            email: [
                requiredCondition,
                emailCondition,
            ],
            recaptchaResponse: [
                requiredCondition,
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

    successCallback = ({ email, recaptchaResponse }) => {
        const url = urlForUserPasswordReset;
        const params = createParamsForUserPasswordReset({ email, recaptchaResponse });
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
                if (this.reCaptcha) {
                    this.reCaptcha.reset();
                }
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
            resetSuccess,
        } = this.state;

        return (
            <div styleName="reset-password">
                <div styleName="form-container">
                    {
                        resetSuccess ? (
                            <div styleName="info">
                                <p>
                                    {this.props.loginStrings('checkInboxText')}
                                    {formValues.email || this.props.loginStrings('emailPlaceholder')}
                                </p>
                            </div>
                        ) : (
                            <Form
                                styleName="reset-password-form"
                                changeCallback={this.changeCallback}
                                elements={this.elements}
                                failureCallback={this.failureCallback}
                                successCallback={this.successCallback}
                                validations={this.validations}
                                value={formValues}
                                error={formFieldErrors}
                                disabled={pending}
                            >
                                { pending && <LoadingAnimation /> }
                                <NonFieldErrors errors={formErrors} />
                                <TextInput
                                    formname="email"
                                    label={this.props.loginStrings('emailLabel')}
                                    placeholder={this.props.loginStrings('emailPlaceholder')}
                                />
                                <ReCaptcha
                                    ref={(reCaptcha) => { this.reCaptcha = reCaptcha; }}
                                    formname="recaptchaResponse"
                                    siteKey={reCaptchaSiteKey}
                                />
                                <div styleName="action-buttons">
                                    <PrimaryButton>
                                        { this.props.loginStrings('submitForgetPassword') }
                                    </PrimaryButton>
                                </div>
                            </Form>
                        )
                    }
                    <div styleName="go-back-container">
                        <Link
                            styleName="go-back-link"
                            to={reverseRoute(pathNames.login, {})}
                        >
                            {this.props.loginStrings('goBackToLoginText')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
