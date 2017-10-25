/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Helmet from 'react-helmet';
import schema from '../../../../common/schema';
import styles from './styles.scss';
import { hidUrl } from '../../../../common/config/hid';
import { LoginForm } from '../../components/Forms';
import {
    loginAction,
    authenticateAction,
} from '../../../../common/action-creators/auth';
import { pageTitles } from '../../../../common/utils/labels';
import { RestRequest, RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForTokenCreate,
    createParamsForTokenCreateHid,
    urlForTokenCreate,
    urlForTokenCreateHid,
} from '../../../../common/rest';
import {
    startTokenRefreshAction,
} from '../../../../common/middlewares/refreshAccessToken';
import {
    setNavbarStateAction,
} from '../../../../common/action-creators/navbar';
import {
    currentUserProjectsSelector,
} from '../../../../common/selectors/domainData';

const propTypes = {
    authenticate: PropTypes.func.isRequired,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
    login: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    startTokenRefresh: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    authenticate: () => dispatch(authenticateAction()),
    login: params => dispatch(loginAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    startTokenRefresh: params => dispatch(startTokenRefreshAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class Login extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { pending: false };
    }

    componentWillMount() {
        console.log('MOUNTING Login');

        this.props.setNavbarState({
            visible: false,
            activeLink: undefined,
            validLinks: undefined,
        });

        this.checkParamsFromHid();
    }

    onHidLoginClick = () => {
        // Just set it to pending
        // The anchor will redirect user to next page
        this.setState({ pending: true });
    }

    onSubmit = ({ email, password }) => {
        const url = urlForTokenCreate;
        const params = createParamsForTokenCreate({ username: email, password });
        this.login({
            url,
            params,
        });
    }

    checkParamsFromHid = () => {
        const { location } = this.props;
        // Get params from the current url
        // NOTE: hid provides query as hash
        const query = RestRequest.parseUrlParams(location.hash.replace('#', ''));
        // Login User with HID access_token
        if (query.access_token) {
            const params = createParamsForTokenCreateHid(query);
            this.login({
                url: urlForTokenCreateHid,
                params,
            });
        } else {
            console.warn('No access_token found');
        }
    }

    login = ({ url, params }) => {
        this.setState({ pending: true });

        // Stop any retry action
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }
        this.userLoginRequest = this.createRequestLogin(url, params);

        this.userLoginRequest.start();
    };

    createRequestLogin = (url, params) => {
        const userLoginRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'tokenGetResponse');
                    const { refresh, access } = response;
                    this.props.login({ refresh, access });

                    // after setAccessToken, current user is verified
                    if (this.props.currentUserProjects.length <= 0) {
                        console.warn('No projects in cache');
                        // if there is no projects, block and get from api
                        this.props.startTokenRefresh(() => {
                            this.props.authenticate();
                        });
                    } else {
                        this.props.startTokenRefresh();
                        this.props.authenticate();
                    }
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
        return userLoginRequest;
    }

    render() {
        const { pending } = this.state;
        return (
            <div styleName="login">
                <Helmet>
                    <title>{ pageTitles.login }</title>
                </Helmet>
                <div styleName="login-form-wrapper">
                    <LoginForm
                        formErrors={this.state.formErrors}
                        formError={this.state.nonFieldErrors}
                        onSubmit={this.onSubmit}
                        pending={pending}
                    />
                </div>
                <div styleName="register-link-container">
                    <p>
                        Don&apos;t have an account yet?
                    </p>
                    <Link
                        to="/register/"
                        styleName="register-link"
                    >
                        Register
                    </Link>
                </div>
                <a
                    onClick={this.onHidLoginClick}
                    href={hidUrl}
                    styleName="register-link"
                >
                    Login With HID
                </a>
            </div>
        );
    }
}
