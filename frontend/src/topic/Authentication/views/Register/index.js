import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Helmet from 'react-helmet';
import schema from '../../../../common/schema';
import styles from './styles.scss';
import { RegisterForm } from '../../components/Forms';
import { pageTitles } from '../../../../common/utils/labels';
import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../../../common/rest';
import {
    setNavbarStateAction,
} from '../../../../common/action-creators/navbar';


const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(null, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            pending: false,
            registrationSuccessful: false,
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

    onRegister = (data) => {
        this.setState({ pending: true });

        // Stop previous retry
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
        this.userCreateRequest = this.createRequestRegister(data);
        this.userCreateRequest.start();
    }

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
            .success((response) => {
                try {
                    schema.validate(response, 'userCreateResponse');
                    this.setState({
                        pending: false,
                        registrationSuccessful: true,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const { errors } = response;
                const { nonFieldErrors } = errors;
                const formErrors = {};
                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formErrors[key] = errors[key].join(' ');
                    }
                });
                formErrors.email = formErrors.username;

                this.setState({ pending: false, formErrors, nonFieldErrors });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({ pending: false });
            })
            .build();
        return userCreateRequest;
    }

    render() {
        if (this.state.registrationSuccessful) {
            return (
                <Redirect to="/login" />
            );
        }

        const { nonFieldErrors } = this.state;
        return (
            <div styleName="register">
                <Helmet>
                    <title>{ pageTitles.register }</title>
                </Helmet>
                <div styleName="non-field-errors">
                    {
                        (nonFieldErrors || []).map(err => (
                            <div
                                key={err}
                                styleName="error"
                            >
                                {err}
                            </div>
                        ))
                    }
                </div>
                <div styleName="register-form-wrapper">
                    <RegisterForm
                        formErrors={this.state.formErrors}
                        onSubmit={this.onRegister}
                        pending={this.state.pending}
                    />
                </div>
                <div styleName="login-link-container">
                    <p>
                        Already have an account yet?
                    </p>
                    <Link
                        to="/login/"
                        styleName="login-link"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }
}
