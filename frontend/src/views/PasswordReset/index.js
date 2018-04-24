/**
 * @author thenav56 <ayernavin@gmail.com>
 */

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
import Faram, {
    requiredCondition,
    emailCondition,
} from '../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
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
export default class PasswordReset extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            resetSuccess: false,
        };

        this.schema = {
            fields: {
                email: [
                    requiredCondition,
                    emailCondition,
                ],
                recaptchaResponse: [
                    requiredCondition,
                ],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = ({ email, recaptchaResponse }) => {
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
                this.setState({ pending: true });
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
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // FIXME: use strings
                this.setState({
                    faramErrors: { $internal: ['Error while trying to reset password.'] },
                });
            })
            .build();
        return userPasswordRestRequest;
    }

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            resetSuccess,
        } = this.state;

        return (
            <div className={styles.resetPassword}>
                <div className={styles.formContainer}>
                    {
                        resetSuccess ? (
                            <div className={styles.info}>
                                <p>
                                    {
                                        this.props.loginStrings('checkInboxText', { email: faramValues.email })
                                    }
                                </p>
                            </div>
                        ) : (
                            <Faram
                                className={styles.resetPasswordForm}
                                onChange={this.handleFaramChange}
                                onValidationFailure={this.handleFaramValidationFailure}
                                onValidationSuccess={this.handleFaramValidationSuccess}
                                schema={this.schema}
                                value={faramValues}
                                error={faramErrors}
                                disabled={pending}
                            >
                                { pending && <LoadingAnimation /> }
                                <NonFieldErrors faramElement />
                                <TextInput
                                    faramElementName="email"
                                    label={this.props.loginStrings('emailLabel')}
                                    placeholder={this.props.loginStrings('emailPlaceholder')}
                                />
                                <ReCaptcha
                                    ref={(reCaptcha) => { this.reCaptcha = reCaptcha; }}
                                    faramElementName="recaptchaResponse"
                                    siteKey={reCaptchaSiteKey}
                                />
                                <div className={styles.actionButtons}>
                                    <PrimaryButton type="submit">
                                        { this.props.loginStrings('submitForgetPassword') }
                                    </PrimaryButton>
                                </div>
                            </Faram>
                        )
                    }
                    <div className={styles.goBackContainer}>
                        <Link
                            className={styles.goBackLink}
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
