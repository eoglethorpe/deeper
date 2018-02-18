/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    FgRestBuilder,
    RestRequest,
} from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ReCaptcha from '../../vendor/react-store/components/Input/ReCaptcha';
import Form, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForTokenCreate,
    urlForTokenCreate,
    createParamsForTokenCreateHid,
    urlForTokenCreateHid,
} from '../../rest';
import {
    loginAction,
    authenticateAction,

    currentUserProjectsSelector,
    loginStringsSelector,
} from '../../redux';
import { startRefreshAction } from '../../redux/middlewares/refresher';
import { startSiloBackgroundTasksAction } from '../../redux/middlewares/siloBackgroundTasks';
import { pathNames } from '../../constants';
import schema from '../../schema';
import { hidUrl } from '../../config/hid';
import { reCaptchaSiteKey } from '../../config/reCaptcha';

import logo from '../../resources/img/deep-logo.svg';
import hidLogo from '../../resources/img/hid-logo.png';

import styles from './styles.scss';

const propTypes = {
    authenticate: PropTypes.func.isRequired,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    login: PropTypes.func.isRequired,
    startRefresh: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
    loginStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
    loginStrings: loginStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    authenticate: () => dispatch(authenticateAction()),
    login: params => dispatch(loginAction(params)),
    startRefresh: params => dispatch(startRefreshAction(params)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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
            pristine: false,
            showReCaptcha: false,
        };

        // Data for form elements
        this.elements = ['email', 'password', 'recaptchaResponse'];

        this.validations = {
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
        this.checkParamsFromHid();
    }

    componentWillUnmount() {
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }
    }

    // HID

    onHidLoginClick = () => {
        // Just set it to pending
        // The anchor will redirect user to next page
        this.setState({ pending: true });
    }

    checkParamsFromHid = () => {
        const { location } = this.props;
        // Get params from the current url
        // NOTE: hid provides query as hash
        const query = RestRequest.parseUrlParams(location.hash.replace('#', ''));
        // Login User with HID access_token
        if (query.access_token) {
            const params = createParamsForTokenCreateHid(query);
            this.login({ url: urlForTokenCreateHid, params });
        } else {
            console.warn('No access_token found');
        }
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = ({ email, password, recaptchaResponse }) => {
        const url = urlForTokenCreate;
        const params = createParamsForTokenCreate({
            username: email,
            password,
            recaptchaResponse,
        });
        this.login({ url, params });
    };

    // LOGIN ACTION

    login = ({ url, params }) => {
        // Stop any retry action
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }

        this.userLoginRequest = this.createRequestLogin(url, params);
        this.userLoginRequest.start();
    };

    showReCaptcha = () => {
        this.setState({
            showReCaptcha: true,
        });
    }
    // LOGIN REST API

    createRequestLogin = (url, params) => {
        const userLoginRequest = new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => {
                this.setState({ pending: true, pristine: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'tokenGetResponse');

                    const { refresh, access } = response;
                    this.props.login({ refresh, access });

                    // after setAccessToken, current user is verified
                    if (this.props.currentUserProjects.length <= 0) {
                        console.warn('No projects in cache');
                        // if there is no projects, block and get from api
                        this.props.startRefresh(() => {
                            this.setState({ pending: false });
                            this.props.authenticate();
                        });
                    } else {
                        this.setState({ pending: false });
                        this.props.startRefresh();
                        this.props.authenticate();
                    }
                    // FIXME: Maybe move immediately after authenticate()
                    // Start the locked silo tasks
                    this.props.startSiloTasks(() => {
                        console.log('Silo tasks started');
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                    pending: false,
                });
                if (response.errorCode === 4004) {
                    this.showReCaptcha();
                }
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to log in.'],
                    pending: false,
                });
            })
            .build();
        return userLoginRequest;
    }

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            showReCaptcha,
        } = this.state;

        return (
            <div styleName="login">
                <div styleName="deep-container">
                    <ReactSVG
                        styleName="logo"
                        path={logo}
                    />
                    <h2 styleName="heading">
                        <small>
                            {this.props.loginStrings('welcomeToText')}
                        </small>
                        <br />
                    </h2>
                </div>
                <div styleName="login-form-container">
                    <div styleName="hid-link-container">
                        <a
                            styleName="hid-link"
                            href={hidUrl}
                            onClick={this.onHidLoginClick}
                        >
                            <img
                                styleName="logo"
                                src={hidLogo}
                                alt={this.props.loginStrings('logInWIthHid')}
                                draggable="false"
                            />
                            <span>
                                {this.props.loginStrings('logInWIthHid')}
                            </span>
                        </a>
                        <div styleName="or-container">
                            <hr />
                            <span styleName="or">
                                {this.props.loginStrings('orText')}
                            </span>
                        </div>
                    </div>
                    <Form
                        styleName="login-form"
                        changeCallback={this.changeCallback}
                        elements={this.elements}
                        failureCallback={this.failureCallback}
                        successCallback={this.successCallback}
                        validations={this.validations}
                        value={formValues}
                        error={formFieldErrors}
                    >
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors errors={formErrors} />
                        <TextInput
                            disabled={pending}
                            formname="email"
                            label={this.props.loginStrings('emailLabel')}
                            // FIXME: use strings
                            placeholder="john.doe@mail.com"
                            autoFocus
                        />
                        <TextInput
                            disabled={pending}
                            formname="password"
                            label={this.props.loginStrings('passwordLabel')}
                            // FIXME: use strings
                            placeholder="**********"
                            required
                            type="password"
                        />
                        {
                            showReCaptcha &&
                            <ReCaptcha
                                formname="recaptchaResponse"
                                siteKey={reCaptchaSiteKey}
                                reset={pending}
                            />
                        }
                        <div styleName="action-buttons">
                            <Link
                                styleName="forgot-password-link"
                                to={reverseRoute(pathNames.passwordReset, {})}
                            >
                                {this.props.loginStrings('forgotPasswordText')}
                            </Link>
                            <PrimaryButton disabled={pending}>
                                {this.props.loginStrings('loginLabel')}
                            </PrimaryButton>
                        </div>
                    </Form>
                    <div styleName="register-link-container">
                        <p>
                            {this.props.loginStrings('noAccountYetText')}
                        </p>
                        <Link
                            styleName="register-link"
                            to={reverseRoute(pathNames.register, {})}
                        >
                            {this.props.loginStrings('registerLabel')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
