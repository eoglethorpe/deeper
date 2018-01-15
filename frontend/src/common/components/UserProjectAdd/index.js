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
} from '../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
} from '../../../public/components/Action';

import { FgRestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';
import {
    transformResponseErrorToFormError,
    createParamsForProjectCreate,
    urlForProjectCreate,
} from '../../../common/rest';
import {
    setProjectAction,
    activeUserSelector,
} from '../../../common/redux';
import {
    notificationStrings,
    userStrings,
} from '../../constants';
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
};

const defaultProps = {
    userGroups: [],
    onProjectAdded: undefined,
};

const mapStateToProps = state => ({
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
            pristine: false,
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
                        title: notificationStrings.userProjectCreate,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.userProjectCreateSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.userProjectCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.userProjectCreateFailure,
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
                    title: notificationStrings.userProjectCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.userProjectCreateFatal,
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save project.'],
                });
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
            pristine: true,
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
    handleFormClose = () => {
        this.props.handleModalClose();
    }

    render() {
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            pristine,
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
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={userStrings.addProjectModalLabel}
                    formname="title"
                    placeholder={userStrings.addProjectModalPlaceholder}
                    value={formValues.title}
                    error={formFieldErrors.title}
                    disabled={pending}
                    autoFocus
                />
                <div styleName="action-buttons">
                    <DangerButton
                        type="button"
                        onClick={this.handleFormClose}
                        disabled={pending}
                    >
                        {userStrings.modalCancel}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {userStrings.modalCreate}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
