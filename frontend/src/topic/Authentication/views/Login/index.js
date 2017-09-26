/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { LoginForm } from '../../components/Forms';
import { loginAction } from '../../../../common/action-creators/auth';
import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import styles from './styles.scss';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    login: params => dispatch(loginAction(params)),
});

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        from: PropTypes.shape({
            pathname: PropTypes.string.isRequired,
        }),
    }),
    login: PropTypes.func.isRequired,
};

const defaultProps = {
    location: {},
};


// TODO: move these somewhere else
const wsEndpoint = '/api/v1';
const POST = 'POST';
const postHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const urlForUserLogin = () => `${wsEndpoint}/token/`;
const paramsForUserLogin = (username, password) => ({
    method: POST,
    headers: postHeader,
    body: JSON.stringify({
        username,
        password,
    }),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {};
    }

    onSubmit = (email, password) => {
        const url = urlForUserLogin();
        const paramsFn = () => paramsForUserLogin(
            email, // Username is the email
            password,
        );

        // Stop any retry action
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }

        this.userLoginRequest = new RestBuilder()
            .url(url)
            .params(paramsFn)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                console.info('SUCCESS: ', response);
                try {
                    schema.validate(response, 'userLoginResponse');
                    console.info('Schema validation passed');
                    const { refresh, access } = response;
                    this.props.login({ email, refresh, access });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const { errors } = response;
                const formErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({ formErrors, nonFieldErrors });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();

        this.setState({ pending: true });
        this.userLoginRequest.start();
    }

    render() {
        const { authenticated } = this.props;
        if (authenticated) {
            const from = this.props.location.from || { pathname: '/' };
            return (
                <Redirect to={from} />
            );
        }

        const { nonFieldErrors } = this.state;
        return (
            // TODO: make and error component
            <div styleName="login">
                {
                    nonFieldErrors &&
                    <div styleName="non-field-errors">
                        {
                            nonFieldErrors.map(err => (
                                <div
                                    key={err}
                                    styleName="error"
                                >
                                    {err}
                                </div>
                            ))
                        }
                    </div>
                }
                <div styleName="login-form-wrapper">
                    <LoginForm
                        onSubmit={this.onSubmit}
                    />
                </div>
            </div>
        );
    }
}
