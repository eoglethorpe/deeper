import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { LoginForm } from '../../components/Forms';
import { login, logout } from '../../../../common/action-creators/auth';
import styles from './styles.scss';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    login: (email, password) => dispatch(login(email, password)),
    logout: logout(),
});

const loginProps = {
    login: PropTypes.func.isRequired,
    authenticated: PropTypes.bool.isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            from: PropTypes.shape({
                pathname: PropTypes.string.isRequired,
            }),
        }),
    }),
};

const loginDefaultProps = {
    location: {},
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = loginProps;
    static defaultProps = loginDefaultProps;

    onLogin = (email, password) => {
        this.props.login(email, password);
    }

    render() {
        if (this.props.authenticated) {
            const { from } = this.props.location.state || { from: { pathname: '/' } };
            return (
                <Redirect to={from} />
            );
        }

        return (
            <div styleName="login">
                <div styleName="login-form-wrapper">
                    <LoginForm
                        onLogin={this.onLogin}
                    />
                </div>
            </div>
        );
    }
}
