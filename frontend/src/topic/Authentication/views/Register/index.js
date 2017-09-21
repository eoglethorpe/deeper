import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { RegisterForm } from '../../components/Forms';
import { register } from '../../../../common/action-creators/auth';
import styles from './styles.scss';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

const mapDispatchToProps = dispatch => ({
    register: (
        firstname,
        lastname,
        organization,
        country,
        email,
        password,
    ) => dispatch(
        register(
            firstname,
            lastname,
            organization,
            country,
            email,
            password,
        ),
    ),
});

const loginProps = {
    register: PropTypes.func.isRequired,
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

    render() {
        if (this.props.authenticated) {
            const { from } = this.props.location.state || { from: { pathname: '/' } };
            return (
                <Redirect to={from} />
            );
        }

        return (
            <div styleName="register">
                <div styleName="register-form-wrapper">
                    <RegisterForm
                        onRegister={(
                            firstname,
                            lastname,
                            organization,
                            country,
                            email,
                            password,
                        ) => this.props.register(
                            firstname,
                            lastname,
                            organization,
                            country,
                            email,
                            password,
                        )}
                    />
                </div>
            </div>
        );
    }
}
