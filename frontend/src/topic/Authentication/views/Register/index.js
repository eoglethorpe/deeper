/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import React from 'react';
import {
    Redirect,
    Link,
} from 'react-router-dom';

import {
    LoadingAnimation,
} from '../../../../public/components/View';

import {
    Form,
    NonFieldErrors,
    TextInput,
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/components/Input';
import { PrimaryButton } from '../../../../public/components/Action';
import { FgRestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';

import {
    pathNames,
    loginStrings,
} from '../../../../common/constants';
import schema from '../../../../common/schema';
import {
    transformResponseErrorToFormError,
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../../../common/rest';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Login extends React.PureComponent {
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

            redirectTo: undefined,
        };

        this.elements = ['firstname', 'lastname', 'organization', 'email', 'password'];
        this.validations = {
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
    }

    componentWillUnmount() {
        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
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

    successCallback = (data) => {
        this.register(data);
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

    createRequestRegister = ({ firstname, lastname, organization, country, email, password }) => {
        const userCreateRequest = new FgRestBuilder()
            .url(urlForUserCreate)
            .params(() => createParamsForUserCreate({
                firstName: firstname,
                lastName: lastname,
                organization,
                country,
                email,
                password,
            }))
            .preLoad(() => {
                this.setState({ pending: true, pristine: false });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userCreateResponse');
                    // go to login
                    this.setState({
                        redirectTo: reverseRoute(pathNames.login, {}),
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
                    formErrors: ['Error while trying to register.'],
                });
            })
            .build();
        return userCreateRequest;
    }

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
        } = this.state;

        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />;
        }

        return (
            <div styleName="register">
                <div styleName="register-box">
                    <Form
                        styleName="register-form"
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
                            error={formFieldErrors.firstname}
                            formname="firstname"
                            value={formValues.firstname}
                            label={loginStrings.firstNameLabel}
                            placeholder={loginStrings.firstNamePlaceholder}
                        />
                        <TextInput
                            error={formFieldErrors.lastname}
                            formname="lastname"
                            value={formValues.lastname}
                            label={loginStrings.lastNameLabel}
                            placeholder={loginStrings.lastNamePlaceholder}
                        />
                        <TextInput
                            error={formFieldErrors.organization}
                            formname="organization"
                            value={formValues.organization}
                            label={loginStrings.organizationLabel}
                            placeholder={loginStrings.organizationPlaceholder}
                        />
                        <TextInput
                            error={formFieldErrors.email}
                            formname="email"
                            value={formValues.email}
                            label={loginStrings.emailLabel}
                            placeholder={loginStrings.emailPlaceholder}
                        />
                        <TextInput
                            error={formFieldErrors.password}
                            formname="password"
                            hint={loginStrings.passwordHint}
                            value={formValues.password}
                            label={loginStrings.passwordLabel}
                            required
                            type="password"
                        />
                        <div styleName="action-buttons">
                            <PrimaryButton
                                disabled={pending}
                            >
                                { loginStrings.registerLabel }
                            </PrimaryButton>
                        </div>
                    </Form>
                    <div styleName="login-link-container">
                        <p>
                            {loginStrings.alreadyHaveAccountText}
                        </p>
                        <Link
                            to={reverseRoute(pathNames.login, {})}
                            styleName="login-link"
                        >
                            {loginStrings.loginLabel}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
