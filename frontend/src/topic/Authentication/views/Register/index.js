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
        // get jwt token from store here
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

/*
"username": "",
    "display_picture": null,
    "last_name": "",
    "email": "",
    "organization": "",
    "password": "",
    "first_name": ""
    */

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = loginProps;
    static defaultProps = loginDefaultProps;

    onRegister = (firstname, lastname, organization, country, email, password) => {
        const url = urlForUserCreate();
        const paramsFn = () => paramsForUserCreate(
            firstname, lastname, organization, country, email, password,
        );

        const someRequest = new RestBuilder()
            .url(url)
            .params(paramsFn)
            .success((response) => {
                console.log('success:', response);
                try {
                    schema.validate(response, 'userCreateResponse');
                    console.log('schema validation passed');
                } catch (er) {
                    console.log(er);
                }

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
            })
            .failure((response) => {
                console.log('error:', response);
            })
            .build();

        someRequest.start();
    }

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
                        onRegister={this.onRegister}
                    />
                </div>
            </div>
        );
    }
}
