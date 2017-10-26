/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import FileInput from '../../../../public/components/FileInput';
import FileUpload from '../../../../public/components/FileUpload';
import TextInput from '../../../../public/components/TextInput';
import schema from '../../../../common/schema';
import styles from './styles.scss';
import { hidUrl } from '../../../../common/config/hid';
import { pageTitles } from '../../../../common/utils/labels';
import { PrimaryButton } from '../../../../public/components/Button';

import Form, {
    createValidation,
    emailCondition,
    lengthGreaterThanCondition,
    requiredCondition,
} from '../../../../public/components/Form';

import {
    RestBuilder,
    RestRequest,
} from '../../../../public/utils/rest';
import {
    createParamsForTokenCreate,
    urlForTokenCreate,
    createParamsForTokenCreateHid,
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
import {
    loginAction,
    authenticateAction,
} from '../../../../common/action-creators/auth';


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
            stale: false,

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

        this.props.setNavbarState({
            visible: false,
            activeLink: undefined,
            validLinks: undefined,
        });

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

    changeCallback = (values, { error, errors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...errors },
            formErrors: error,
            stale: true,
        });
    };

    failureCallback = ({ error, errors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...errors },
            formErrors: error,
        });
    };

    successCallback = ({ email, password }) => {
        const url = urlForTokenCreate;
        const params = createParamsForTokenCreate({ username: email, password });
        this.login({ url, params });
    };

    // LOGIN ACTION

    login = ({ url, params }) => {
        this.setState({ pending: true, stale: false });

        // Stop any retry action
        if (this.userLoginRequest) {
            this.userLoginRequest.stop();
        }
        this.userLoginRequest = this.createRequestLogin(url, params);

        this.userLoginRequest.start();
    };

    // LOGIN REST API

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
                const formFieldErrors = {};
                const { nonFieldErrors } = errors;

                Object.keys(errors).forEach((key) => {
                    if (key !== 'nonFieldErrors') {
                        formFieldErrors[key] = errors[key].join(' ');
                    }
                });

                this.setState({
                    formFieldErrors,
                    formErrors: nonFieldErrors,
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
        const {
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            stale,
        } = this.state;
        return (
            <div styleName="login">
                <Helmet>
                    <title>{ pageTitles.login }</title>
                </Helmet>
                <Form
                    styleName="login-form"
                    changeCallback={this.changeCallback}
                    elements={this.elements}
                    failureCallback={this.failureCallback}
                    successCallback={this.successCallback}
                    validation={this.validation}
                    validations={this.validations}
                >
                    {
                        pending &&
                        <div styleName="pending-overlay">
                            <i className="ion-load-c" styleName="loading-icon" />
                        </div>
                    }
                    <div styleName="non-field-errors">
                        {
                            formErrors.map(err => (
                                <div
                                    key={err}
                                    styleName="error"
                                >
                                    {err}
                                </div>
                            ))
                        }
                        { formErrors.length <= 0 &&
                            <div styleName="error empty">
                                -
                            </div>
                        }
                    </div>
                    <TextInput
                        disabled={pending}
                        error={formFieldErrors.email}
                        formname="email"
                        initialValue={formValues.email}
                        label="Email"
                        placeholder="john.doe@mail.com"
                    />
                    <TextInput
                        disabled={pending}
                        error={formFieldErrors.password}
                        formname="password"
                        initialValue={formValues.password}
                        label="Password"
                        placeholder="**********"
                        required
                        type="password"
                    />
                    <div styleName="action-buttons">
                        <PrimaryButton
                            disabled={pending}
                        >
                            { stale ? 'Login*' : 'Login' }
                        </PrimaryButton>
                    </div>
                </Form>
                <div styleName="register-link-container">
                    <p>
                        Do not have an account yet?
                    </p>
                    <Link
                        styleName="register-link"
                        to="/register/"
                    >
                        Register
                    </Link>
                </div>
                <div styleName="register-link-container">
                    <a
                        href={hidUrl}
                        onClick={this.onHidLoginClick}
                        styleName="register-link"
                    >
                        Login With HID
                    </a>
                </div>

                <div>
                    <FileInput
                        showPreview={false}
                        showStatus={false}
                        onChange={this.onUpload}
                    >
                        Open File
                    </FileInput>
                    <ul>
                        {
                            this.state.uploadedFiles.map(file => (
                                <li
                                    key={file.name}
                                >
                                    <FileUpload
                                        key={file.name}
                                        file={file}
                                        autoStart={false}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                </div>

            </div>
        );
    }
}
