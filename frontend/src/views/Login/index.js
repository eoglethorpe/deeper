/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

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
import Faram, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
} from '../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForTokenCreate,
    urlForTokenCreate,
    createParamsForTokenCreateHid,
    urlForTokenCreateHid,
} from '../../rest';
import {
    loginAction,
    authenticateAction,
    loginStringsSelector,
} from '../../redux';
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
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    login: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
    loginStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    loginStrings: loginStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    authenticate: () => dispatch(authenticateAction()),
    login: params => dispatch(loginAction(params)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Login extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            email: [
                requiredCondition,
                emailCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
            ],
        },
    };

    static schemaWithRecaptcha = {
        fields: {
            email: [
                requiredCondition,
                emailCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
            ],
            recaptchaResponse: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
            showReCaptcha: false,
            schema: Login.schema,
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
        }
    }

    // FORM RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = ({ email, password, recaptchaResponse }) => {
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

    // LOGIN REST API

    createRequestLogin = (url, params) => {
        const userLoginRequest = new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => {
                this.setState({ pending: true, pristine: false });
            })
            .postLoad(() => {
                if (this.reCaptcha) {
                    this.reCaptcha.reset();
                }
            })
            .success((response) => {
                try {
                    schema.validate(response, 'tokenGetResponse');

                    const { refresh, access } = response;
                    this.props.login({ refresh, access });
                    this.props.startSiloTasks(() => console.log('Silo tasks started'));
                    this.props.authenticate();
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({
                    faramErrors,
                    pending: false,
                });
                if (response.errorCode === 4004) {
                    this.setState({
                        showReCaptcha: true,
                        schema: Login.schemaWithRecaptcha,
                    });
                }
            })
            .fatal(() => {
                this.setState({
                    faramErrors: { $internal: ['Error while trying to log in.'] },
                    pending: false,
                });
            })
            .build();
        return userLoginRequest;
    }

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            showReCaptcha,
        } = this.state;

        return (
            <div className={styles.login}>
                <div className={styles.deepContainer}>
                    <ReactSVG
                        className={styles.logo}
                        path={logo}
                    />
                    <h2 className={styles.heading}>
                        <small>{this.props.loginStrings('welcomeToText')}</small><br />
                    </h2>
                </div>
                <div className={styles.loginFormContainer}>
                    <div className={styles.hidLinkContainer}>
                        <a
                            className={styles.hidLink}
                            href={hidUrl}
                            onClick={this.onHidLoginClick}
                        >
                            <img
                                className={styles.logo}
                                src={hidLogo}
                                alt={this.props.loginStrings('logInWIthHid')}
                                draggable="false"
                            />
                            <span>{this.props.loginStrings('logInWIthHid')}</span>
                        </a>
                        <div className={styles.orContainer}>
                            <hr /><span className={styles.or}>{this.props.loginStrings('orText')}</span>
                        </div>
                    </div>
                    { pending && <LoadingAnimation /> }
                    <Faram
                        className={styles.loginForm}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}
                        schema={this.state.schema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={pending}
                    >
                        <NonFieldErrors faramElementName="anyName" />
                        <TextInput
                            faramElementName="email"
                            label={this.props.loginStrings('emailLabel')}
                            // FIXME: use strings
                            placeholder="john.doe@mail.com"
                            autoFocus
                        />
                        <TextInput
                            faramElementName="password"
                            label={this.props.loginStrings('passwordLabel')}
                            // FIXME: use strings
                            placeholder="**********"
                            required
                            type="password"
                        />
                        { showReCaptcha &&
                            <ReCaptcha
                                ref={(reCaptcha) => { this.reCaptcha = reCaptcha; }}
                                faramElementName="recaptchaResponse"
                                siteKey={reCaptchaSiteKey}
                            />
                        }
                        <div className={styles.actionButtons}>
                            <Link
                                className={styles.forgotPasswordLink}
                                to={reverseRoute(pathNames.passwordReset, {})}
                            >
                                {this.props.loginStrings('forgotPasswordText')}
                            </Link>
                            <PrimaryButton
                                type="submit"
                            >
                                {this.props.loginStrings('loginLabel')}
                            </PrimaryButton>
                        </div>
                    </Faram>
                    <div className={styles.registerLinkContainer}>
                        <p>{this.props.loginStrings('noAccountYetText')}</p>
                        <Link
                            className={styles.registerLink}
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
