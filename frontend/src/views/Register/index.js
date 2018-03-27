/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ReCaptcha from '../../vendor/react-store/components/Input/ReCaptcha';
import Form, {
    requiredCondition,
    emailCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../rest';
import { loginStringsSelector } from '../../redux';
import { pathNames } from '../../constants';
import { reCaptchaSiteKey } from '../../config/reCaptcha';
import schema from '../../schema';

import styles from './styles.scss';

const propTypes = {
    loginStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    loginStrings: loginStringsSelector(state),
});

@connect(mapStateToProps)
export default class Register extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
            success: false,
        };

        this.schema = {
            fields: {
                firstname: [requiredCondition],
                lastname: [requiredCondition],
                organization: [requiredCondition],
                email: [
                    requiredCondition,
                    emailCondition,
                ],
                recaptchaResponse: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
    }

    // FORM RELATED

    changeCallback = (values, fieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formErrors,
            formFieldErrors: fieldErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        this.register(values);
    };

    // REGISTER ACTION

    register = (data) => {
        // Stop previous retry
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
        this.userCreateRequest = this.createRequestRegister(data);
        this.userCreateRequest.start();
    }

    // REGISTER REST API

    createRequestRegister = ({
        firstname, lastname, organization, country, email, recaptchaResponse,
    }) => {
        const userCreateRequest = new FgRestBuilder()
            .url(urlForUserCreate)
            .params(() => createParamsForUserCreate({
                firstName: firstname,
                lastName: lastname,
                organization,
                country,
                email,
                recaptchaResponse,
            }))
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
                    schema.validate(response, 'userCreateResponse');
                    // go to login
                    this.setState({
                        success: true,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                // NOTE: server uses username, client side uses email
                formFieldErrors.email = formFieldErrors.username;
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: { errors: ['Error while trying to register.'] },
                });
            })
            .build();
        return userCreateRequest;
    }

    renderForm = () => {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
        } = this.state;

        return (
            <Form
                className={styles.registerForm}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <TextInput
                    formname="firstname"
                    label={this.props.loginStrings('firstNameLabel')}
                    placeholder={this.props.loginStrings('firstNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    formname="lastname"
                    label={this.props.loginStrings('lastNameLabel')}
                    placeholder={this.props.loginStrings('lastNamePlaceholder')}
                />
                <TextInput
                    formname="organization"
                    label={this.props.loginStrings('organizationLabel')}
                    placeholder={this.props.loginStrings('organizationPlaceholder')}
                />
                <TextInput
                    formname="email"
                    label={this.props.loginStrings('emailLabel')}
                    placeholder={this.props.loginStrings('emailPlaceholder')}
                />
                <ReCaptcha
                    ref={(reCaptcha) => { this.reCaptcha = reCaptcha; }}
                    formname="recaptchaResponse"
                    siteKey={reCaptchaSiteKey}
                    reset={pending}
                />
                <div className={styles.actionButtons}>
                    <PrimaryButton
                        type="submit"
                    >
                        { this.props.loginStrings('registerLabel')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }

    renderSuccess = () => {
        const { email } = this.state.formValues;
        return (
            <div className={styles.registerSuccess}>
                {this.props.loginStrings('checkYourEmailText', { email })}
            </div>
        );
    }

    render() {
        const {
            success,
        } = this.state;

        return (
            <div className={styles.register}>
                <div className={styles.registerBox}>
                    { success ? this.renderSuccess() : this.renderForm() }
                    <div className={styles.loginLinkContainer}>
                        <p>
                            { success ?
                                this.props.loginStrings('goBackToLoginText') :
                                this.props.loginStrings('alreadyHaveAccountText')
                            }
                        </p>
                        <Link
                            to={reverseRoute(pathNames.login, {})}
                            className={styles.loginLink}
                        >
                            {this.props.loginStrings('loginLabel')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
