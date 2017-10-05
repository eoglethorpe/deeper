import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import schema from '../../../../common/schema';
import styles from './styles.scss';
import { RegisterForm } from '../../components/Forms';
import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../../../common/rest';
import {
    authenticatedSelector,
} from '../../../../common/selectors/auth';

const mapStateToProps = state => ({
    authenticated: authenticatedSelector(state),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            from: PropTypes.shape({
                pathname: PropTypes.string.isRequired,
            }),
        }),
    }),
};

const defaultProps = {
    location: {},
};

@connect(mapStateToProps, mapDispatchToProps)
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

    componentWillUnmount() {
        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
    }

    onRegister = ({ firstname, lastname, organization, country, email, password }) => {
        const url = urlForUserCreate;
        const params = createParamsForUserCreate({
            firstName: firstname,
            lastName: lastname,
            organization,
            country,
            email,
            password,
        });

        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }

        this.userCreateRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'userCreateResponse');
                } catch (er) {
                    console.error(er);
                }

                this.setState({
                    pending: false,
                    registrationSuccessful: true,
                });
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

        this.setState({ pending: true });
        this.userCreateRequest.start();
    }

    render() {
        if (this.props.authenticated) {
            const { from } = this.props.location.state || { from: { pathname: '/' } };
            return (
                <Redirect to={from} />
            );
        } else if (this.state.registrationSuccessful) {
            return (
                <Redirect to="/login" />
            );
        }

        const { nonFieldErrors } = this.state;
        return (
            <div styleName="register">
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
                        onRegister={this.onRegister}
                        pending={this.state.pending}
                    />
                </div>
                <div styleName="login-link-container">
                    <p>Already have an account yet?</p>
                    <Link to="/login" styleName="login-link">Login</Link>
                </div>
            </div>
        );
    }
}
