/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import schema from '../../../../common/schema';
import styles from './styles.scss';
import { LoginForm } from '../../components/Forms';
import { loginAction } from '../../../../common/action-creators/auth';
import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForTokenCreate,
    urlForTokenCreate,
} from '../../../../common/rest';
import {
    startTokenRefreshAction,
} from '../../../../common/middlewares/refreshAccessToken';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    login: params => dispatch(loginAction(params)),
    startTokenRefresh: () => dispatch(startTokenRefreshAction()),
});

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    from: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    login: PropTypes.func.isRequired,
    startTokenRefresh: PropTypes.func.isRequired,
};

const defaultProps = {
    from: undefined,
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
        };
    }

    onSubmit = ({ email, password }) => {
        const url = urlForTokenCreate;
        const params = createParamsForTokenCreate({ username: email, password });

        // Stop any retry action
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }

        this.userLoginRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'userLoginResponse');
                    const { refresh, access } = response;
                    this.props.login({ email, refresh, access });
                    this.props.startTokenRefresh();
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

                this.setState({
                    formErrors,
                    nonFieldErrors,
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({ pending: false });
            })
            .build();

        this.setState({ pending: true });
        this.userLoginRequest.start();
    }

    render() {
        const { authenticated } = this.props;

        if (authenticated) {
            const from = this.props.from || { pathname: '/' };
            return (
                <Redirect to={from} />
            );
        }

        const { nonFieldErrors, pending } = this.state;
        return (
            <div styleName="login">
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
                <div styleName="login-form-wrapper">
                    <LoginForm
                        onSubmit={this.onSubmit}
                        pending={pending}
                    />
                </div>
                <div styleName="register-link-container">
                    <p>Don&apos;t have an account yet?</p>
                    <Link to="/register" styleName="register-link">Register</Link>
                </div>
            </div>
        );
    }
}
