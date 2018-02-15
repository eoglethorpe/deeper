/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import React from 'react';
import {
    Redirect,
    Link,
} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import Form, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../rest';
import { loginStringsSelector } from '../../redux';
import { pathNames } from '../../constants';
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
                        validations={this.validations}
                        value={formValues}
                        error={formFieldErrors}
                    >
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors errors={formErrors} />
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
                        <TextInput
                            formname="password"
                            hint={this.props.loginStrings('passwordHint')}
                            label={this.props.loginStrings('passwordLabel')}
                            required
                            type="password"
                        />
                        <div styleName="action-buttons">
                            <PrimaryButton
                                disabled={pending}
                            >
                                { this.props.loginStrings('registerLabel')}
                            </PrimaryButton>
                        </div>
                    </Form>
                    <div styleName="login-link-container">
                        <p>
                            {this.props.loginStrings('alreadyHaveAccountText')}
                        </p>
                        <Link
                            to={reverseRoute(pathNames.login, {})}
                            styleName="login-link"
                        >
                            {this.props.loginStrings('loginLabel')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
