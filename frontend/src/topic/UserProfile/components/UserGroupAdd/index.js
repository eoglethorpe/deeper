/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import { RestBuilder } from '../../../../public/utils/rest';

import schema from '../../../../common/schema';
import {
    createParamsForProjectCreate,
    urlForUserGroups,
} from '../../../../common/rest';
import {
    activeUserSelector,
    setUserGroupAction,
    tokenSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setUserGroup: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroupAdd extends React.PureComponent {
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
        };

        this.elements = [
            'title',
        ];

        this.validations = {
            title: [requiredCondition],
        };
    }

    componentWillMount() {
        console.warn('Mounting User Group Add');
    }

    componentWillUnmount() {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }
    }

    createRequestForUserGroupCreate = ({ title }) => {
        const userGroupCreateRequest = new RestBuilder()
            .url(urlForUserGroups)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectCreate(
                    { access },
                    { title });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupCreateResponse');
                    this.props.setUserGroup({
                        userId: this.props.activeUser.userId,
                        userGroup: response,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
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
            })
            .build();
        return userGroupCreateRequest;
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }

        this.userGroupCreateRequest = this.createRequestForUserGroupCreate(values);
        this.userGroupCreateRequest.start();
    };

    // BUTTONS
    handleFormClose = (e) => {
        e.preventDefault();
        this.props.handleModalClose();
    }

    render() {
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            stale,
        } = this.state;

        return (
            <Form
                styleName="user-group-add-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validations={this.validations}
            >
                {
                    pending &&
                    <div styleName="pending-overlay">
                        <i
                            className="ion-load-c"
                            styleName="loading-icon"
                        />
                    </div>
                }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="ACAPS"
                    value={formValues.title}
                    error={formFieldErrors.title}
                    disabled={pending}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.handleFormClose}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Create
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
