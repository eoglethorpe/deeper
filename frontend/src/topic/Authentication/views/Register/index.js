import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { RegisterForm } from '../../components/Forms';
import { register } from '../../../../common/action-creators/auth';
import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
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


// TODO: move these somewhere else
const wsEndpoint = '/api/v1';
const POST = 'POST';
const postHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const urlForUserCreate = () => `${wsEndpoint}/users/`;
const paramsForUserCreate = (firstname, lastname, organization, country, email, password) => ({
    method: POST,
    headers: {
        ...postHeader,
        // TODO: get jwt token from store here
    },
    body: JSON.stringify({
        firstName: firstname,
        lastName: lastname,
        organization,
        country,
        email,
        password,
        username: email,
    }),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = loginProps;
    static defaultProps = loginDefaultProps;

    constructor(props) {
        super(props);
        this.state = { pending: false };
    }

    onRegister = (firstname, lastname, organization, country, email, password) => {
        const url = urlForUserCreate();
        const paramsFn = () => paramsForUserCreate(
            firstname, lastname, organization, country, email, password,
        );

        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
        this.userCreateRequest = new RestBuilder()
            .url(url)
            .params(paramsFn)
            .success((response) => {
                console.log('success:', response);
                try {
                    schema.validate(response, 'userCreateResponse');
                    console.log('schema validation passed');

                    // TODO: register will get tokens, save those
                    // not the form data
                    this.props.register(
                        firstname,
                        lastname,
                        organization,
                        country,
                        email,
                        password,
                    );
                } catch (er) {
                    console.log(er);
                }
                this.setState({ pending: false });
            })
            .failure((response) => {
                console.log('failure error:', response);
                const { errors } = response;
                const formErrors = {};
                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formErrors[key] = errors[key].join(' ');
                    }
                });
                formErrors.email = formErrors.username;

                this.setState({ pending: false, formErrors });
            })
            .fatal((response) => {
                console.log('fatal error', response);
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
        }

        // TODO: Add div to show error from rest request

        return (
            <div styleName="register">
                <div styleName="register-form-wrapper">
                    <RegisterForm
                        onRegister={this.onRegister}
                        formErrors={this.state.formErrors}
                        pending={this.state.pending}
                    />
                </div>
            </div>
        );
    }
}
