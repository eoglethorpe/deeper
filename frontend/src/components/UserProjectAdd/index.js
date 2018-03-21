/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Form, { requiredCondition } from '../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    transformResponseErrorToFormError,
    createParamsForProjectCreate,
    urlForProjectCreate,
} from '../../rest';
import {
    notificationStringsSelector,
    userStringsSelector,
    setProjectAction,
    activeUserSelector,
} from '../../redux';
import schema from '../../schema';

import notify from '../../notify';
import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onProjectAdded: PropTypes.func,
    userGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
    })),
    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    userGroups: [],
    onProjectAdded: undefined,
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
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
            formErrors: {},
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.projectCreateRequest) {
            this.projectCreateRequest.stop();
        }
    }

    createRequestForProjectCreate = ({ title }) => {
        const userGroups = this.props.userGroups;

        const projectCreateRequest = new FgRestBuilder()
            .url(urlForProjectCreate)
            .params(() => createParamsForProjectCreate({ title, userGroups }))
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
                    if (this.props.onProjectAdded) {
                        this.props.onProjectAdded(response.id);
                    }
                    notify.send({
                        title: this.props.notificationStrings('userProjectCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userProjectCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userProjectCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userProjectCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userProjectCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userProjectCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to save project.'] },
                });
            })
            .build();
        return projectCreateRequest;
    }

    // FORM RELATED

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
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
    handleFormClose = () => {
        this.props.handleModalClose();
    }

    render() {
        const {
            formValues,
            formErrors,
            formFieldErrors,
            pending,
            pristine,
        } = this.state;

        return (
            <Form
                className={styles.userProjectAddForm}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                disabled={pending}
                fieldErrors={formFieldErrors}
                formErrors={formErrors}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <TextInput
                    label={this.props.userStrings('addProjectModalLabel')}
                    formname="title"
                    placeholder={this.props.userStrings('addProjectModalPlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        type="button"
                        onClick={this.handleFormClose}
                    >
                        {this.props.userStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {this.props.userStrings('modalCreate')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
