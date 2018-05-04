/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import ReCaptcha from '../../vendor/react-store/components/Input/ReCaptcha';
import Faram, {
    requiredCondition,
    emailCondition,
} from '../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForUserCreate,
    urlForUserCreate,
} from '../../rest';
import { pathNames } from '../../constants';
import { reCaptchaSiteKey } from '../../config/reCaptcha';
import schema from '../../schema';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class Register extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
            success: false,
        };

        this.schema = {
            fields: {
                firstname: [requiredCondition],
                lastname: [requiredCondition],
                organization: [requiredCondition],
                email: [
                    requiredCondition,
                    emailCondition,
                ],
                recaptchaResponse: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
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

    handleFaramValidationSuccess = (values) => {
        this.register(values);
    };

    // REGISTER ACTION

    register = (data) => {
        // Stop previous retry
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
        this.userCreateRequest = this.createRequestRegister(data);
        this.userCreateRequest.start();
    }

    // REGISTER REST API

    createRequestRegister = ({
        firstname, lastname, organization, country, email, recaptchaResponse,
    }) => {
        const userCreateRequest = new FgRestBuilder()
            .url(urlForUserCreate)
            .params(() => createParamsForUserCreate({
                firstName: firstname,
                lastName: lastname,
                organization,
                country,
                email,
                recaptchaResponse,
            }))
            .preLoad(() => {
                this.setState({ pending: true, pristine: false });
            })
            .postLoad(() => {
                if (this.reCaptcha) {
                    this.reCaptcha.reset();
                }
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userCreateResponse');
                    // go to login
                    this.setState({
                        success: true,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                // NOTE: server uses username, client side uses email
                faramErrors.email = faramErrors.username;
                this.setState({ faramErrors });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    faramErrors: { $internal: ['Error while trying to register.'] },
                });
            })
            .build();
        return userCreateRequest;
    }

    renderFaram = () => {
        const {
            faramErrors,
            faramValues,
            pending,
        } = this.state;

        return (
            <Faram
                className={styles.registerForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="firstname"
                    label={_ts('login', 'firstNameLabel')}
                    placeholder={_ts('login', 'firstNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    faramElementName="lastname"
                    label={_ts('login', 'lastNameLabel')}
                    placeholder={_ts('login', 'lastNamePlaceholder')}
                />
                <TextInput
                    faramElementName="organization"
                    label={_ts('login', 'organizationLabel')}
                    placeholder={_ts('login', 'organizationPlaceholder')}
                />
                <TextInput
                    faramElementName="email"
                    label={_ts('login', 'emailLabel')}
                    placeholder={_ts('login', 'emailPlaceholder')}
                />
                <ReCaptcha
                    ref={(reCaptcha) => { this.reCaptcha = reCaptcha; }}
                    faramElementName="recaptchaResponse"
                    siteKey={reCaptchaSiteKey}
                    reset={pending}
                />
                <div className={styles.actionButtons}>
                    <PrimaryButton type="submit" >
                        { _ts('login', 'registerLabel')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }

    renderSuccess = () => {
        const { email } = this.state.faramValues;
        return (
            <div className={styles.registerSuccess}>
                {_ts('login', 'checkYourEmailText', { email })}
            </div>
        );
    }

    render() {
        const {
            success,
        } = this.state;

        return (
            <div className={styles.register}>
                <div className={styles.registerBox}>
                    { success ? this.renderSuccess() : this.renderFaram() }
                    <div className={styles.loginLinkContainer}>
                        <p>
                            { success ?
                                _ts('login', 'goBackToLoginText') :
                                _ts('login', 'alreadyHaveAccountText')
                            }
                        </p>
                        <Link
                            to={reverseRoute(pathNames.login, {})}
                            className={styles.loginLink}
                        >
                            {_ts('login', 'loginLabel')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
