/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Form,
    NonFieldErrors,
    TextInput,
    createValidation,
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/components/Input';
import { PrimaryButton } from '../../../../public/components/Action';
import {
    FgRestBuilder,
    RestRequest,
} from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';

import {
    pathNames,
} from '../../../../common/constants';
import schema from '../../../../common/schema';
import { hidUrl } from '../../../../common/config/hid';
import {
    transformResponseErrorToFormError,
    createParamsForTokenCreate,
    urlForTokenCreate,
    createParamsForTokenCreateHid,
    urlForTokenCreateHid,
} from '../../../../common/rest';

import {
    startRefreshAction,
} from '../../../../common/middlewares/refresher';
import {
    startSiloBackgroundTasksAction,
} from '../../../../common/middlewares/siloBackgroundTasks';
import logo from '../../../../img/deep-logo-white.png';
import hidLogo from '../../../../img/hid-logo.png';

import {
    loginAction,
    authenticateAction,

    currentUserProjectsSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    authenticate: PropTypes.func.isRequired,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
    login: PropTypes.func.isRequired,
    startRefresh: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
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

            uploadedFiles: [],
        };

        // Data for form elements
        this.elements = ['email', 'password'];
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
        // TODO: remove this validation later, just for example
        this.validation = createValidation('email', 'password', (email, password) => {
            if (password.length > email.length) {
                return {
                    ok: false,
                    formErrors: ['Form has combined validation error.'],
                    formFieldErrors: {
                        email: 'Email must be longer than password',
                        password: 'Password must be shorter than email',
                    },
                };
            }
            return { ok: true };
        });
    }

    componentWillMount() {
        console.log('MOUNTING Login');

        this.checkParamsFromHid();
    }

    // HID

    onHidLoginClick = () => {
        // Just set it to pending
        // The anchor will redirect user to next page
        this.setState({ pending: true });
    }

    onUpload = (files) => {
        const { uploadedFiles } = this.state;
        this.setState({ uploadedFiles: [...uploadedFiles, ...files] });
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

    successCallback = ({ email, password }) => {
        const url = urlForTokenCreate;
        const params = createParamsForTokenCreate({ username: email, password });
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
                this.setState({ pending: false });
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
                            this.props.authenticate();
                        });
                    } else {
                        this.props.startRefresh();
                        this.props.authenticate();
                    }

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
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to log in.'],
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
            pristine,
        } = this.state;
        return (
            <div styleName="login">
                <div styleName="deep-container">
                    <img
                        styleName="logo"
                        src={logo}
                        alt="DEEP"
                        draggable="false"
                    />
                    <h2 styleName="heading">Data entry and exploration platform</h2>
                </div>
                <div styleName="login-box">
                    <div styleName="hid-link-container">
                        <a
                            styleName="hid-link"
                            href={hidUrl}
                            onClick={this.onHidLoginClick}
                        >
                            <img
                                styleName="logo"
                                src={hidLogo}
                                alt="Login with HID"
                                draggable="false"
                            />
                            <span>Login with HID</span>
                        </a>
                        <div styleName="or-container">
                            <hr />
                            <span styleName="or">Or</span>
                        </div>
                    </div>
                    <Form
                        styleName="login-form"
                        changeCallback={this.changeCallback}
                        elements={this.elements}
                        failureCallback={this.failureCallback}
                        successCallback={this.successCallback}
                        validation={this.validation}
                        validations={this.validations}
                    >
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors errors={formErrors} />
                        <TextInput
                            disabled={pending}
                            error={formFieldErrors.email}
                            formname="email"
                            value={formValues.email}
                            label="Email"
                            placeholder="john.doe@mail.com"
                        />
                        <TextInput
                            disabled={pending}
                            error={formFieldErrors.password}
                            formname="password"
                            value={formValues.password}
                            label="Password"
                            placeholder="**********"
                            required
                            type="password"
                        />
                        <div styleName="action-buttons">
                            <PrimaryButton
                                disabled={pending}
                            >
                                { pristine ? 'Login*' : 'Login' }
                            </PrimaryButton>
                        </div>
                    </Form>
                    <div styleName="register-link-container">
                        <p>
                            Do not have an account yet?
                        </p>
                        <Link
                            styleName="register-link"
                            to={reverseRoute(pathNames.register, {})}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
