/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    Form,
    NonFieldErrors,
    TextInput,
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/components/Input';
import { PrimaryButton } from '../../../../public/components/Action';
import { RestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';

import {
    pageTitles,
    pathNames,
} from '../../../../common/constants';
import browserHistory from '../../../../common/browserHistory';
import schema from '../../../../common/schema';
import {
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../../../common/rest';
import { setNavbarStateAction } from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(null, mapDispatchToProps)
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
            stale: false,
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

    componentWillMount() {
        this.props.setNavbarState({
            visible: false,
            activeLink: undefined,
            validLinks: undefined,
        });
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
            stale: true,
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
        const url = urlForUserCreate;
        const params = createParamsForUserCreate({
            firstName: firstname,
            lastName: lastname,
            organization,
            country,
            email,
            password,
        });
        const userCreateRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.setState({ pending: true, stale: false });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userCreateResponse');
                    // go to login
                    browserHistory.push(reverseRoute(pathNames.login, {}));
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const { errors } = response;
                const { nonFieldErrors } = errors;
                const formFieldErrors = {};
                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formFieldErrors[key] = errors[key].join(' ');
                    }
                });
                formFieldErrors.email = formFieldErrors.username;

                this.setState({
                    formFieldErrors,
                    formErrors: nonFieldErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
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
            stale,
        } = this.state;

        return (
            <div styleName="register">
                <Helmet>
                    <title>{ pageTitles.register }</title>
                </Helmet>
                <Form
                    styleName="register-form"
                    changeCallback={this.changeCallback}
                    elements={this.elements}
                    failureCallback={this.failureCallback}
                    successCallback={this.successCallback}
                    validation={this.validation}
                    validations={this.validations}
                >
                    {
                        pending &&
                        <div styleName="pending-overlay">
                            <i className="ion-load-c" styleName="loading-icon" />
                        </div>
                    }
                    <NonFieldErrors errors={formErrors} />
                    <TextInput
                        error={formFieldErrors.firstname}
                        formname="firstname"
                        value={formValues.firstname}
                        label="First name"
                        placeholder="John"
                    />
                    <TextInput
                        error={formFieldErrors.lastname}
                        formname="lastname"
                        value={formValues.lastname}
                        label="Last name"
                        placeholder="Doe"
                    />
                    <TextInput
                        error={formFieldErrors.organization}
                        formname="organization"
                        value={formValues.organization}
                        label="Organization"
                        placeholder="Togglecorp"
                    />
                    <TextInput
                        error={formFieldErrors.email}
                        formname="email"
                        value={formValues.email}
                        label="Email"
                        placeholder="john.doe@mail.com"
                    />
                    <TextInput
                        error={formFieldErrors.password}
                        formname="password"
                        hint="Password should be more than four characters long."
                        value={formValues.password}
                        label="Password"
                        required
                        type="password"
                    />
                    <div styleName="action-buttons">
                        <PrimaryButton
                            disabled={pending}
                        >
                            { stale ? 'Register*' : 'Register' }
                        </PrimaryButton>
                    </div>
                </Form>
                <div styleName="login-link-container">
                    <p>
                        Already have an account yet?
                    </p>
                    <Link
                        to={reverseRoute(pathNames.login, {})}
                        styleName="login-link"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }
}
