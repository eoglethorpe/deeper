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
    urlForProjectCreate,
} from '../../../../common/rest';
import {
    tokenSelector,
    setProjectAction,
    activeUserSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
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
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserProjectAdd extends React.PureComponent {
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

    componentWillUnmount() {
        if (this.projectCreateRequest) {
            this.projectCreateRequest.stop();
        }
    }

    createRequestForProjectCreate = ({ title }) => {
        const projectCreateRequest = new RestBuilder()
            .url(urlForProjectCreate)
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
                    schema.validate(response, 'projectCreateResponse');
                    this.props.setProject({
                        userId: this.props.activeUser.userId,
                        project: response,
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
        return projectCreateRequest;
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
        if (this.projectCreateRequest) {
            this.projectCreateRequest.stop();
        }

        this.projectCreateRequest = this.createRequestForProjectCreate(values);
        this.projectCreateRequest.start();
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
                styleName="user-project-add-form"
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
                    label="Project Title"
                    formname="title"
                    placeholder="Enter project name"
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
